// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

import path from 'path';

import {
  paths,
  getArgv,
  execa,
  execaOptions,
  unicodeEmoji as icons,
  userConfig,
} from '@tablecheck/frontend-utils';
import * as prompts from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import glob from 'glob';

import { configCheck } from './configs.js';
import { formatPackages, lintAllPackages } from './package.js';
import { validateEslintrc } from './validateEslintrc.js';
import { runEslint } from './runEslint.js';

export async function lint() {
  prompts.intro(chalk.blue.bold('Running code quality and formatting checks'));
  const argv = getArgv({
    boolean: ['fix'],
    default: {
      fix: false,
    },
  });

  if (!(await configCheck())) return;
  console.log();

  const shouldSkipTypescript = argv['skip-typescript'];
  const globPaths = [path.join(paths.cwd, '*')];
  const globPathsForDisplay = [...globPaths];
  if (fs.existsSync(paths.appSrc)) {
    globPathsForDisplay.push(paths.appSrc);
    globPaths.push(path.join(paths.appSrc, '**', '*'));
    globPaths.push(path.join(paths.appSrc, '*'));
  }
  if (fs.existsSync(paths.cypress)) {
    globPathsForDisplay.push(paths.cypress);
    globPaths.push(path.join(paths.cypress, '**', '*'));
    globPaths.push(path.join(paths.cypress, '*'));
  }
  if (fs.existsSync(paths.storybook)) {
    globPathsForDisplay.push(paths.storybook);
    globPaths.push(path.join(paths.storybook, '**', '*'));
    globPaths.push(path.join(paths.storybook, '*'));
  }

  if (userConfig.additionalRoots) {
    userConfig.additionalRoots.forEach((root) => {
      globPathsForDisplay.push(path.join(paths.cwd, root));
      globPaths.push(path.join(paths.cwd, root, '**', '*'));
      globPaths.push(path.join(paths.cwd, root, '*'));
    });
  }

  await validateEslintrc();
  const isThisRepo =
    fs.readJsonSync(paths.appPackageJson).name === 'tablecheck-frontend';

  console.log(
    chalk.blue(`\nChecking${argv.fix ? ' and fixing' : ''} files matching:`),
  );
  globPathsForDisplay.forEach((globPath) => {
    console.log(`  ${path.relative(paths.cwd, globPath)}`);
  });
  console.log('');
  if (argv.fix) {
    await formatPackages();
    console.log('');
  } else if (!isThisRepo && !(await lintAllPackages())) {
    throw new Error('Lint failed');
  }

  console.log(
    chalk.blue(`Checking${argv.fix ? ' and fixing' : ''} eslint rules...\n`),
  );
  const eslintPaths = globPaths
    .map((globPath) => `${globPath}.{js,jsx,ts,tsx}`)
    .filter(
      (globPath) =>
        glob.sync(globPath, { cwd: paths.cwd, silent: true }).length > 0,
    )
    .map((globPath) => path.relative(paths.cwd, globPath));
  const spawnedEslint = runEslint(eslintPaths, argv.fix);

  const spawnedPrettier = (argv.fix ? spawnedEslint : Promise.resolve())
    .catch(() => {})
    .then(() => {
      const prettierArgs = ['--ignore-unknown'];
      if (argv.fix) {
        console.log(chalk.blue('Fixing prettier formatting...'));
        prettierArgs.push('--write', '--loglevel=warn');
      } else {
        prettierArgs.push('--check');
      }
      if (!argv.package || argv.package === '*') {
        prettierArgs.push('*');
      }
      return execa(
        'prettier',
        prettierArgs.concat(
          globPaths.filter(
            (globPath) =>
              glob.sync(`${globPath}.*`, {
                cwd: paths.cwd,
                silent: true,
              }).length > 0,
          ),
        ),
        execaOptions,
      );
    });

  const [linterResults, prettierResults] = await Promise.allSettled([
    spawnedEslint,
    spawnedPrettier,
  ]);

  console.log(chalk.blue.bold('\nCode check results;'));

  if (!shouldSkipTypescript) {
    if (
      tscResult.status === 'rejected' ||
      cypressTscResult.status === 'rejected'
    ) {
      console.error(
        chalk.red.bold(
          `  ${icons.error} Typescript failed due to the above errors`,
        ),
      );
    } else {
      console.log(chalk.green(`  ${icons.check} Type checking passes`));
    }
  }

  if (prettierResults.status !== 'rejected') {
    console.log(
      chalk.green(`  ${icons.check} All files formatted with prettier`),
    );
  } else {
    console.log(
      chalk.red.bold(`  ${icons.error} Files not formatted with prettier`),
    );
  }

  if (linterResults.status !== 'rejected') {
    console.log(chalk.green(`  ${icons.check} Linter success`));
  } else {
    console.log(
      chalk.red.bold(`  ${icons.error} Eslint failed due to the above errors`),
    );
  }

  if (
    [
      tscResult.status,
      cypressTscResult.status,
      linterResults.status,
      prettierResults.status,
    ].indexOf('rejected') !== -1
  ) {
    console.log(
      chalk.cyan(
        `
  ${icons.info}  Code quality checks failed, try running with --fix to attempt to automatically fix some issues.
`,
      ),
    );
    throw new Error('Lint failed');
  }
}
