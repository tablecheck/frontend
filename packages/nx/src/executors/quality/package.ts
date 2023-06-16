import * as path from 'path';

import {
  getLernaPaths,
  processPackage,
  unicodeEmoji as icons,
} from '@tablecheck/frontend-utils';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import type { PackageJson } from 'type-fest';

async function evaluatePackage({
  dependencies,
  devDependencies,
  name,
}: PackageJson) {
  // package.json version keys check
  const invalidVersionValues: string[] = [];
  const lernaPaths = await getLernaPaths();
  const lernaPackageNames = lernaPaths.map((lernaPath) => {
    const packageJson = fs.readJsonSync(
      path.join(lernaPath, 'package.json'),
    ) as PackageJson;
    return packageJson.name;
  });

  function validateVersion(
    key: string,
    version: string | undefined,
    packageName: string | undefined,
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
    validateVersion(key, dependencies?.[key], name),
  );
  Object.keys(devDependencies || {}).forEach((key) =>
    validateVersion(key, devDependencies?.[key], name),
  );

  return invalidVersionValues;
}

export async function packageCheck({
  directory,
  shouldFix,
}: {
  directory: string;
  shouldFix: boolean;
}) {
  console.log(
    chalk.cyan(
      `  ${icons.info}  We recommend using \`npm-upgrade\` to manage dependencies.\n`,
    ),
  );
  const result = await processPackage({
    packageDir: directory,
    shouldWriteFile: shouldFix,
    packageProcessor: async (appPackage, packagePath) => {
      const displayPath = path.relative(process.cwd(), packagePath);
      const invalidVersionValues = await evaluatePackage(appPackage);

      if (invalidVersionValues.length) {
        console.error(
          chalk.red(`${icons.error} Invalid Package: ${displayPath}`),
        );
        console.log(
          'Dependencies in package.json must be absolute. The only exception are sibling lerna monorepo packages, which may use `^`.',
        );
        console.log(
          `The following dependencies are invalid;\n - ${invalidVersionValues.join(
            '\n - ',
          )}`,
        );
        throw new Error('Invalid dependencies');
      }

      return appPackage;
    },
  });
  if (result.success) {
    console.log(chalk.green(`${icons.check} Package dependencies validated`));
  }
  return result;
}
