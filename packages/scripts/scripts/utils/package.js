const path = require('path');

const chalk = require('chalk');
const fs = require('fs-extra');
const {
  format: prettyFormatPackage,
  check: checkPackageFormat
} = require('prettier-package-json');

const paths = require('../../config/paths');

const { getArgv } = require('./argv');
const { execaSync } = require('./execa');
const { getLernaPaths } = require('./lerna');
const icons = require('./unicodeEmoji');

const argv = getArgv();

// see https://github.com/cameronhunter/prettier-package-json/blob/master/src/defaultOptions.js
// for defaults
const prettyFormatOptions = {
  useTabs: false,
  tabWidth: 2,
  keyOrder: [
    /**
     * Details
     */
    '$schema',
    'private',
    'name',
    'description',
    'license',
    'author',
    'maintainers',
    'contributors',
    'homepage',
    'repository',
    'bugs',
    'version',
    'type',
    /**
     * Used for npm search
     */
    'keywords',
    /**
     * Yarn specific
     */
    'workspaces',
    /**
     * Configuration
     */
    'entry',
    'main',
    'module',
    'browser',
    'man',
    'preferGlobal',
    'types',
    'typings',
    'bin',
    'files',
    'directories',
    'scripts',
    'config',
    'sideEffects',
    /**
     * Dependencies
     */
    'optionalDependencies',
    'dependencies',
    'bundleDependencies',
    'bundledDependencies',
    'peerDependencies',
    'devDependencies',
    /**
     * Constraints
     */
    'engines',
    'engine-strict',
    'engineStrict',
    'os',
    'cpu',
    /**
     * Package publishing configuration
     */
    'publishConfig'
  ]
};

async function evaluatePackage({ dependencies, devDependencies, name }) {
  // package.json version keys check
  const invalidVersionValues = [];
  const lernaPaths = await getLernaPaths();
  const lernaPackageNames = lernaPaths.map((lernaPath) => {
    const packageJson = fs.readJsonSync(path.join(lernaPath, 'package.json'));
    return packageJson.name;
  });

  function validateVersion(key, version, packageName) {
    if (!version) {
      invalidVersionValues.push(`${key}@${version}`);
      return;
    }
    // lerna sibling package check
    const isLernaDependency = lernaPackageNames.indexOf(packageName) > -1;
    if (isLernaDependency && /^\^/i.test(version)) {
      return;
    }

    const isValidVersion =
      /^([0-9]|http|git|(\/|)[a-z-_]+(\/[a-z-_]+)*)/gi.test(version);
    const isRange = / (-|\|\|) /gi.test(version);
    const hasLooseMatch = /\.x$/gi.test(version);

    if (!isValidVersion || isRange || hasLooseMatch) {
      invalidVersionValues.push(`${key}@${version}`);
    }
  }

  Object.keys(dependencies || {}).forEach((key) =>
    validateVersion(key, dependencies[key], name)
  );
  Object.keys(devDependencies || {}).forEach((key) =>
    validateVersion(key, devDependencies[key], name)
  );

  return invalidVersionValues;
}

async function lintPackage(appPackage, packagePath) {
  const displayPath = path.relative(paths.cwd, packagePath);
  const invalidVersionValues = await evaluatePackage(appPackage);

  if (invalidVersionValues.length) {
    console.error(chalk.red(`${icons.error} Invalid Package: ${displayPath}`));
    console.log(
      'Dependencies in package.json must be absolute. The only exception are sibling lerna monorepo packages, which may use `^`.'
    );
    console.log(
      `The following dependencies are invalid;\n - ${invalidVersionValues.join(
        '\n - '
      )}`
    );
    return false;
  }
  if (
    !checkPackageFormat(
      fs.readFileSync(packagePath, 'utf8'),
      prettyFormatOptions
    )
  ) {
    console.error(
      chalk.red(
        `${icons.error} Package format is invalid, run lint with --fix to correct: ${displayPath}`
      )
    );
    return false;
  }

  return true;
}

function writePrettyPackage(packagePath, packageJson) {
  const appPackage = prettyFormatPackage(packageJson, prettyFormatOptions);
  fs.writeFileSync(packagePath, appPackage, 'utf8');
  return execaSync('prettier', ['-u', '-w', '--loglevel=warn', packagePath], {
    cwd: paths.cwd,
    preferLocal: true
  });
}

async function processAllPackages(packageProcessor, writeFile = true) {
  async function processor(packagePath) {
    try {
      const packageContent = require(packagePath);
      const result = await packageProcessor(packageContent, packagePath);
      if (writeFile && typeof result === 'object') {
        writePrettyPackage(packagePath, result);
      }
      return {
        success: true,
        result
      };
    } catch (error) {
      console.error(`Error occurred in processing package ${packagePath}`);
      console.error(error);
      return { success: false, error };
    }
  }

  const lernaPackageFiles = (await getLernaPaths())
    .filter((lernaPath) => {
      if (!argv.package || argv.package === '*') return true;
      const packageName = lernaPath.split('/').slice(-1)[0];
      return packageName === argv.package;
    })
    .map((lernaPath) => path.join(lernaPath, 'package.json'));

  if (lernaPackageFiles.length) {
    const packageChecks = await Promise.allSettled(
      lernaPackageFiles.map((packagePath) => processor(packagePath))
    );
    return packageChecks.reduce(
      (allSuccessful, packageSuccess) =>
        allSuccessful && packageSuccess.value && packageSuccess.value.success,
      true
    );
  }

  return processor(path.join(paths.cwd, 'package.json'));
}

async function format() {
  console.log(chalk.blue.bold('Formatting package.json file(s)...'));
  return processAllPackages((packageContent) => packageContent);
}

async function lintAllPackages() {
  console.log(
    chalk.cyan(
      `  ${icons.info}  We recommend using \`npm-upgrade\` to manage dependencies.\n`
    )
  );
  const success = await processAllPackages(lintPackage, false);
  if (success) {
    console.log(chalk.green(`${icons.check} Package dependencies validated`));
  }
  return success;
}

module.exports = {
  lintAllPackages,
  processAllPackages,
  evaluatePackage,
  format
};
