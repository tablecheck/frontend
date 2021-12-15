// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

const path = require('path');

const systemSettings = require('@tablecheck/scripts-utils/userConfig');
const chalk = require('chalk');
const fs = require('fs-extra');
const glob = require('glob');

const paths = require('../config/paths');

const { getArgv } = require('./utils/argv');
const { configCheck } = require('./utils/configs');
const {
  configureAppTypescript,
  configureLibTypescript
} = require('./utils/configureTypescript');
const { execa, execaOptions } = require('./utils/execa');
const { getLernaPaths } = require('./utils/lerna');
const { lintAllPackages, format: formatPackages } = require('./utils/package');
const icons = require('./utils/unicodeEmoji');
const validateEslintrc = require('./utils/validateEslintrc');
const verifyPackageTree = require('./utils/verifyPackageTree');
const { runEslint } = require('./utils/runEslint');

// Do the preflight check
if (process.env.SKIP_PREFLIGHT_CHECK !== 'true') {
  verifyPackageTree();
}

const argv = getArgv({
  boolean: ['fix', 'skip-typescript'],
  default: {
    fix: false,
    'skip-typescript': false
  }
});

(async () => {
  console.log(chalk.blue.bold('Running code quality and formatting checks...'));
  configCheck();
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

  if (systemSettings.additionalRoots) {
    systemSettings.additionalRoots.forEach((root) => {
      globPathsForDisplay.push(path.join(paths.cwd, root));
      globPaths.push(path.join(paths.cwd, root, '**', '*'));
      globPaths.push(path.join(paths.cwd, root, '*'));
    });
  }

  const lernaPaths = await getLernaPaths();

  if (lernaPaths.length) {
    lernaPaths.forEach((lernaPath) => {
      const globPackage = lernaPath.split('/').slice(-1)[0];
      if (argv.package && argv.package !== '*') {
        if (globPackage !== argv.package) return;
      }
      let folders = ['src'];
      if (
        systemSettings &&
        systemSettings.lintFolderOverrides &&
        systemSettings.lintFolderOverrides[globPackage]
      ) {
        folders = systemSettings.lintFolderOverrides[globPackage];
      }
      folders.forEach((folder) => {
        globPaths.push(path.join(lernaPath, folder, '**', '*'));
        globPaths.push(path.join(lernaPath, folder, '*'));
      });
      globPaths.push(path.join(lernaPath, '*'));
      globPathsForDisplay.push(lernaPath);
    });
  }

  const eslintRcFile = validateEslintrc();
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
    process.exit(1);
    return;
  }

  const isLib =
    !systemSettings.isAppWithExports &&
    (fs.existsSync(path.join(paths.cwd, 'lerna.json')) ||
      fs.existsSync(path.join(paths.cwd, 'lib')));
  let spawnedTypescript = Promise.resolve('skipped');
  let spawnedCypressTypescript = Promise.resolve('skipped');
  if (isLib) {
    await configureLibTypescript(false, false);
  } else {
    configureAppTypescript(false);
  }
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
  const spawnedEslint = runEslint(eslintRcFile, eslintPaths, argv.fix);

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
    await configureLibTypescript(false, false, true);
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
    process.exit(1);
  } else {
    process.exit(0);
  }
})();
