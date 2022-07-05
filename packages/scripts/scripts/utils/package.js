const path = require('path');

const chalk = require('chalk');
const fs = require('fs-extra');
const { uniqBy } = require('lodash');
const {
  format: prettyFormatPackage,
  check: checkPackageFormat
} = require('prettier-package-json');

const paths = require('../../config/paths');

const { getArgv } = require('./argv');
const { execaSync } = require('./execa');
const { getLernaPaths } = require('./lerna');
const icons = require('./unicodeEmoji');
const { logTaskStart, logTaskEnd } = require('./taskLogFormatter');

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

async function validateLernaDeps() {
  logTaskStart('Checking lerna package versions');
  const lernaPaths = await getLernaPaths();
  const rootPackage = fs.readJSONSync(path.join(process.cwd(), 'package.json'));
  const childPackages = await Promise.all(
    lernaPaths.map(async (p) => [
      p,
      await fs.readJSON(path.join(p, 'package.json'))
    ])
  );
  const rootDependencies = {
    ...(rootPackage.dependencies || {}),
    ...(rootPackage.devDependencies || {}),
    ...(rootPackage.optionalDependencies || {})
  };
  const childDependencies = {};
  const messages = [];
  childPackages.forEach(([childPath, packageJson]) => {
    const invalidEntries = Object.entries(packageJson.dependencies || {})
      .map((tuple) => ['dependencies', ...tuple])
      .concat(
        Object.entries(packageJson.devDependencies || {}).map((tuple) => [
          'devDependencies',
          ...tuple
        ])
      )
      .concat(
        Object.entries(packageJson.optionalDependencies || {})
          .filter(
            ([packageName]) =>
              !(packageJson.devDependencies || {})[packageName] &&
              !(packageJson.dependencies || {})[packageName]
          )
          .map((tuple) => ['optionalDependencies', ...tuple])
      )
      .filter(([depType, packageName, version]) => {
        if (childDependencies[packageName]) {
          childDependencies[packageName].push([depType, childPath, version]);
        } else {
          childDependencies[packageName] = [[depType, childPath, version]];
        }
        if (version.match(/^file:/gi)) {
          if (!rootDependencies[packageName].match(/^file:/gi)) return false;
          const rootDepFilePath = rootDependencies[packageName].split(':')[1];
          const childDepFilePath = version.split(':')[1];
          return (
            path.join(process.cwd(), rootDepFilePath) !==
            path.join(childPath, childDepFilePath)
          );
        }
        return (
          rootDependencies[packageName] &&
          rootDependencies[packageName] !== version
        );
      });
    if (invalidEntries.length > 0) {
      const title = chalk.red.bold(
        `Invalid dependencies in ${path.relative(process.cwd(), childPath)}`
      );
      const childMessages = [];
      invalidEntries.forEach(([depType, packageName, version]) => {
        if (!rootDependencies[packageName]) return;
        childMessages.push(
          `  - ${chalk.yellow(
            `${depType} "${packageName}": "${version}"`
          )} should be ${chalk.green(
            `"${packageName}": "${rootDependencies[packageName]}"`
          )}`
        );
      });
      messages.push([title, childMessages, childPath]);
    }
  });
  const invalidChildDependencies = Object.entries(childDependencies).filter(
    ([, dependencies]) => uniqBy(dependencies, 2).length > 1
  );
  const hasErrors = messages.length || invalidChildDependencies.length;
  logTaskEnd(!hasErrors);
  if (invalidChildDependencies.length) {
    console.log(
      chalk.yellow.bold(
        'The following packages have different versions in sibling packages.'
      )
    );
    invalidChildDependencies.forEach(([packageName, dependencies]) => {
      console.log(chalk.yellow`  - Package "${packageName}"`);
      dependencies.forEach(([depType, childDepPath, version]) => {
        console.log(
          `    ${path.relative(process.cwd(), childDepPath)} has ${chalk.yellow(
            `${depType} "${version}"`
          )}`
        );
      });
    });
  }
  if (messages.length) {
    messages.forEach(([title, childMessages]) => {
      console.log(title);
      childMessages.forEach((message) => console.log(message));
    });
  }
  if (hasErrors) {
    throw new Error('Lerna child package versions do not match root versions');
  }
}

module.exports = {
  lintAllPackages,
  processAllPackages,
  evaluatePackage,
  format,
  validateLernaDeps
};
