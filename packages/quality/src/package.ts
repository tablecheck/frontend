import path from 'path';

import {
  getLernaPaths,
  getPackageJson,
  logTaskEnd,
  logTaskStart,
  paths,
  processAllPackages,
  unicodeEmoji as icons,
  userConfig
} from '@tablecheck/scripts-utils';
import chalk from 'chalk';
import fs from 'fs-extra';
import _ from 'lodash';
import { PackageJson } from 'type-fest';

const { uniqBy } = _;

async function evaluatePackage({
  dependencies,
  devDependencies,
  name
}: PackageJson) {
  // package.json version keys check
  const invalidVersionValues: string[] = [];
  const lernaPaths = await getLernaPaths();
  const lernaPackageNames = lernaPaths.map((lernaPath) => {
    const packageJson = fs.readJsonSync(path.join(lernaPath, 'package.json'));
    return packageJson.name;
  });

  function validateVersion(
    key: string,
    version: string | undefined,
    packageName: string | undefined
  ) {
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
    validateVersion(key, dependencies?.[key], name)
  );
  Object.keys(devDependencies || {}).forEach((key) =>
    validateVersion(key, devDependencies?.[key], name)
  );

  return invalidVersionValues;
}

export async function formatPackages() {
  console.log(chalk.blue.bold('Formatting package.json file(s)...'));
  return processAllPackages((packageContent) => packageContent, true);
}

export async function lintAllPackages() {
  console.log(
    chalk.cyan(
      `  ${icons.info}  We recommend using \`npm-upgrade\` to manage dependencies.\n`
    )
  );
  const success = await processAllPackages(async (appPackage, packagePath) => {
    const displayPath = path.relative(paths.cwd, packagePath);
    const invalidVersionValues = await evaluatePackage(appPackage);

    if (invalidVersionValues.length) {
      console.error(
        chalk.red(`${icons.error} Invalid Package: ${displayPath}`)
      );
      console.log(
        'Dependencies in package.json must be absolute. The only exception are sibling lerna monorepo packages, which may use `^`.'
      );
      console.log(
        `The following dependencies are invalid;\n - ${invalidVersionValues.join(
          '\n - '
        )}`
      );
      throw new Error();
    }

    return appPackage;
  }, false);
  if (success) {
    console.log(chalk.green(`${icons.check} Package dependencies validated`));
  }
  return success;
}

export async function validateLernaDeps() {
  logTaskStart('Checking lerna package versions');
  const lernaPaths = await getLernaPaths();
  const rootPackage = fs.readJSONSync(path.join(process.cwd(), 'package.json'));
  const childPackages = await Promise.all(
    lernaPaths
      .filter(
        (name) =>
          !userConfig.independentLernaPackages ||
          !userConfig.independentLernaPackages.includes(
            path.relative(process.cwd(), name)
          )
      )
      .map((p) => [p, getPackageJson(p)] as const)
  );
  const rootDependencies = {
    ...(rootPackage.dependencies || {}),
    ...(rootPackage.devDependencies || {}),
    ...(rootPackage.optionalDependencies || {})
  };
  type DependencyTuple = [string, string, string];
  const childDependencies: Record<string, DependencyTuple[]> = {};
  const messages: [string, string[], string][] = [];
  childPackages.forEach(([childPath, packageJson]) => {
    const invalidEntries = Object.entries(packageJson.dependencies || {})
      .map((tuple) => ['dependencies', ...tuple] as DependencyTuple)
      .concat(
        Object.entries(packageJson.devDependencies || {}).map(
          (tuple) => ['devDependencies', ...tuple] as DependencyTuple
        )
      )
      .concat(
        Object.entries(packageJson.optionalDependencies || {})
          .filter((value): value is [string, string] => {
            const [packageName, version] = value;
            return (
              !!version &&
              !(packageJson.devDependencies || {})[packageName] &&
              !(packageJson.dependencies || {})[packageName]
            );
          })
          .map((tuple) => ['optionalDependencies', ...tuple] as DependencyTuple)
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
      const childMessages: string[] = [];
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
