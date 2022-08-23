// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

import path from 'path';

import {
  paths,
  getArgv,
  execa,
  execaOptions,
  getLernaPaths,
  unicodeEmoji as icons,
  userConfig
} from '@tablecheck/scripts-utils';
import { configureTypescript } from '@tablecheck/scripts-typescript';
import chalk from 'chalk';
import { ExecaReturnValue } from 'execa';
import fs from 'fs-extra';
import glob from 'glob';

import { configCheck } from './configs.js';
import {
  formatPackages,
  lintAllPackages,
  validateLernaDeps
} from './package.js';
import { validateEslintrc } from './validateEslintrc.js';
import { verifyPackageTree } from './verifyPackageTree.js';
import { runEslint } from './runEslint.js';

export async function lint() {
  console.log('[debug]', 'enter');
  // Do the preflight check
  if (process.env.SKIP_PREFLIGHT_CHECK !== 'true') {
    verifyPackageTree();
  }
  console.log('[debug]', 'gets the argv');
  const argv = getArgv({
    boolean: ['fix', 'skip-typescript'],
    default: {
      fix: false,
      'skip-typescript': false
    }
  });

  const lernaPaths = await getLernaPaths();

  console.log(chalk.blue.bold('Running code quality and formatting checks...'));
  if (!configCheck()) return;
  if (lernaPaths.length) await validateLernaDeps();
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

  if (lernaPaths.length) {
    lernaPaths.forEach((lernaPath) => {
      const globPackage = lernaPath.split('/').slice(-1)[0];
      if (argv.package && argv.package !== '*') {
        if (globPackage !== argv.package) return;
      }
      let folders = ['src'];
      if (
        userConfig &&
        userConfig.lintFolderOverrides &&
        userConfig.lintFolderOverrides[globPackage]
      ) {
        folders = userConfig.lintFolderOverrides[globPackage];
      }
      folders.forEach((folder) => {
        globPaths.push(path.join(lernaPath, folder, '**', '*'));
        globPaths.push(path.join(lernaPath, folder, '*'));
      });
      globPaths.push(path.join(lernaPath, '*'));
      globPathsForDisplay.push(lernaPath);
    });
  }

  validateEslintrc();
  const isThisRepo =
    fs.readJsonSync(paths.appPackageJson).name === 'tablecheck-react-system';

  console.log(
    chalk.blue(`\nChecking${argv.fix ? ' and fixing' : ''} files matching:`)
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

  const isLib =
    !userConfig.isAppWithExports &&
    (fs.existsSync(path.join(paths.cwd, 'lerna.json')) ||
      fs.existsSync(path.join(paths.cwd, 'lib')));
  let spawnedTypescript = Promise.resolve({
    isCanceled: false,
    command: 'skipped',
    exitCode: 0,
    escapedCommand: 'skipped'
  } as ExecaReturnValue<string>);
  let spawnedCypressTypescript = Promise.resolve({
    isCanceled: false,
    command: 'skipped',
    exitCode: 0,
    escapedCommand: 'skipped'
  } as ExecaReturnValue<string>);
  await configureTypescript({ isBuild: false, shouldCleanLibs: false });
  if (!shouldSkipTypescript) {
    console.log(chalk.blue(`Checking typescript...\n`));
    let tscArgs = ['--build'];
    let { cwd } = paths;
    if (argv.package && argv.package !== '*') {
      const foundPackage = lernaPaths.find((lernaPath) => {
        const globPackage = lernaPath.split('/').slice(-1)[0];
        return globPackage === argv.package;
      });
      if (foundPackage) {
        cwd = foundPackage;
        tscArgs = ['--project', path.join(foundPackage, 'tsconfig.json')];
      }
    }
    // spawn this one and let it run! Manually output the stdout later
    // the noEmit is set inside configureLibTypescript
    spawnedTypescript = execa('tsc', tscArgs.concat(['--pretty']), {
      cwd,
      preferLocal: true
    });
    if (fs.existsSync(paths.cypress)) {
      spawnedCypressTypescript = execa('tsc', tscArgs.concat(['--pretty']), {
        cwd: paths.cypress,
        preferLocal: true
      });
    }
  }

  console.log(
    chalk.blue(`Checking${argv.fix ? ' and fixing' : ''} eslint rules...\n`)
  );
  const eslintPaths = globPaths
    .map((globPath) => `${globPath}.{js,jsx,ts,tsx}`)
    .filter(
      (globPath) =>
        glob.sync(globPath, { cwd: paths.cwd, silent: true }).length > 0
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
                silent: true
              }).length > 0
          )
        ),
        execaOptions
      );
    });

  const [tscResult, cypressTscResult, linterResults, prettierResults] =
    await Promise.allSettled([
      spawnedTypescript,
      spawnedCypressTypescript,
      spawnedEslint,
      spawnedPrettier
    ]);

  if (
    !shouldSkipTypescript &&
    (tscResult.status === 'rejected' || cypressTscResult.status === 'rejected')
  ) {
    if (tscResult.status === 'rejected') {
      console.log(chalk.bold('\nTypescript errors;\n'));
      console.log(tscResult.reason.stdout || tscResult.reason.stderr);
    }
    if (cypressTscResult.status === 'rejected') {
      console.log(chalk.bold('\nCypress Typescript errors;\n'));
      console.log(
        cypressTscResult.reason.stdout || cypressTscResult.reason.stderr
      );
    }
  }

  if (argv.package && argv.package !== '*' && isLib) {
    console.log(chalk.blue('\nCleaning up...'));
    await configureTypescript({
      isBuild: false,
      shouldCleanLibs: false,
      shouldIgnorePackageArg: true
    });
  }
  console.log(chalk.blue.bold('\nCode check results;'));

  if (!shouldSkipTypescript) {
    if (
      tscResult.status === 'rejected' ||
      cypressTscResult.status === 'rejected'
    ) {
      console.error(
        chalk.red.bold(
          `  ${icons.error} Typescript failed due to the above errors`
        )
      );
    } else {
      console.log(chalk.green(`  ${icons.check} Type checking passes`));
    }
  }

  if (prettierResults.status !== 'rejected') {
    console.log(
      chalk.green(`  ${icons.check} All files formatted with prettier`)
    );
  } else {
    console.log(
      chalk.red.bold(`  ${icons.error} Files not formatted with prettier`)
    );
  }

  if (linterResults.status !== 'rejected') {
    console.log(chalk.green(`  ${icons.check} Linter success`));
  } else {
    console.log(
      chalk.red.bold(`  ${icons.error} Eslint failed due to the above errors`)
    );
  }

  if (
    [
      tscResult.status,
      cypressTscResult.status,
      linterResults.status,
      prettierResults.status
    ].indexOf('rejected') !== -1
  ) {
    console.log(
      chalk.cyan(
        `
  ${icons.info}  Code quality checks failed, try running with --fix to attempt to automatically fix some issues.
`
      )
    );
    throw new Error('Lint failed');
  }
}
