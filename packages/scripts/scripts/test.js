// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  console.error(err);
  throw new Error();
});

const path = require('path');

const systemSettings = require('@tablecheck/scripts-utils/userConfig');
const chalk = require('chalk');
const fs = require('fs-extra');
const { run: runJest } = require('jest-cli');

const paths = require('../config/paths');

const { getArgv } = require('./utils/argv');
const createJestConfig = require('./utils/createJestConfig');
const { getLernaPaths } = require('./utils/lerna');
const verifyPackageTree = require('./utils/verifyPackageTree');

if (process.env.SKIP_PREFLIGHT_CHECK !== 'true') {
  verifyPackageTree();
}

(async () => {
  const argv = getArgv({
    boolean: ['coverage', 'watchAll', 'watch'],
    string: ['outputFile'],
    default: {
      coverage: false,
      watchAll: false,
      watch: false
    }
  });

  // Watch unless on CI, in coverage mode, or explicitly running all tests
  if (!process.env.CI && !argv.outputFile && !argv.coverage && !argv.watchAll) {
    argv.watch = true;
  }

  // for legacy support, you probably don't need this anymore
  let srcRoots = systemSettings.testRoots || false;

  const lernaPaths = await getLernaPaths();
  if (!srcRoots) {
    if (lernaPaths.length) {
      srcRoots = [];
      lernaPaths.forEach((lernaPath) => {
        const packageName = lernaPath.split('/').slice(-1)[0];
        if (argv.package && argv.package !== '*') {
          if (packageName !== argv.package) return;
        }
        srcRoots.push(path.join(lernaPath, 'src'));
      });
      if (fs.existsSync(paths.appSrc)) {
        srcRoots.push(paths.appSrc);
      }
    } else {
      srcRoots = [paths.appSrc];
    }
  }
  let moduleDirectories;
  if (lernaPaths.length) {
    moduleDirectories = lernaPaths
      .map((lernaPath) => path.join(lernaPath, 'node_modules'))
      .map((absolutePath) => path.relative(paths.cwd, absolutePath));
    moduleDirectories.push('node_modules');
  } else {
    moduleDirectories = ['src', 'node_modules'];
  }

  const { _args: args } = argv;

  ['watch', 'coverage', 'watchAll', 'outputFile'].forEach((key) => {
    if (argv[key]) {
      args.push(`--${key}${argv[key] ? `=${argv[key]}` : ''}`);
    }
  });

  const baseJestConfig = createJestConfig(
    (relativePath) => path.resolve(__dirname, '..', relativePath),
    path.resolve(paths.appSrc, '..'),
    srcRoots,
    moduleDirectories
  );
  let modifiedJestConfig = baseJestConfig;

  if (fs.existsSync(paths.appJestConfig)) {
    const jestConfigModifier = require(paths.appJestConfig);
    modifiedJestConfig = jestConfigModifier(baseJestConfig);
    console.log(
      chalk.yellow.bold(
        'overriding the default jest configuration could have unintended consequences; please use jest normally by removing jest.config.js if possible.'
      )
    );
  }

  args.push('--config', JSON.stringify(modifiedJestConfig));

  if (argv.verbose) {
    console.log(chalk.gray(`\n> jest.run([${args.join(', ')}])\n`));
  }
  runJest(args);
})();
