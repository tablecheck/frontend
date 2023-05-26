import path from 'path';

import chalk from 'chalk';
import * as fs from 'fs-extra';
import type { PackageJson } from 'type-fest';
import * as semver from 'semver';
import {
  format as prettyFormatPackage,
  check as checkPackageFormat,
} from 'prettier-package-json';

import { getArgv } from './argv';
import { writePrettyFile } from './prettier';
import { getLernaPaths } from './lerna';
import { unicodeEmoji } from './unicodeEmoji';

const argv = getArgv();

export function getPackageJson(directory = process.cwd()) {
  return fs.readJsonSync(path.join(directory, 'package.json')) as PackageJson;
}

export function detectInstalledVersion(
  cwd: string,
  packageName: string,
  semverVersion: string,
): string {
  const packageJsonPath = path.join(
    cwd,
    'node_modules',
    packageName,
    'package.json',
  );
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`${packageName} not detected at '${packageJsonPath}'`);
  }
  const packageJson = fs.readJSONSync(packageJsonPath);
  if (
    !packageJson.version ||
    !semver.satisfies(packageJson.version, semverVersion)
  ) {
    throw new Error(
      `${packageName} does not match not version ${semverVersion}, actual version '${packageJson.version}'`,
    );
  }
  if (argv.verbose) {
    console.log(
      chalk.gray(
        `${packageName} at version '${packageJson.version}' detected in installed dependencies!`,
      ),
    );
  }
  return packageJsonPath;
}

declare module 'type-fest' {
  namespace PackageJson {
    export interface NonStandardEntryPoints {
      /**
       * Entry file used for generating a bundle using @tablecheck/scripts-library
       */
      entry?: string;

      /**
       * Entry files used for generating multiple bundles using @tablecheck/scripts-library
       */
      entries?: string[];
      /**
       * A list of files/folders that should be included in the build output of @tablecheck/scripts-library
       */
      assets?: string[];
    }
  }
}

// see https://github.com/cameronhunter/prettier-package-json/blob/master/src/defaultOptions.js
// for defaults
const prettyFormatOptions: Parameters<typeof checkPackageFormat>[1] = {
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
    'exports',
    'entry',
    'entries',
    'assets',
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
    'engineStrict',
    'os',
    'cpu',
    /**
     * Package publishing configuration
     */
    'publishConfig',
  ],
};

export async function processAllPackages(
  packageProcessor: (
    packageContent: PackageJson,
    filePath: string,
  ) => PackageJson | Promise<PackageJson>,
  writeFile = true,
) {
  async function processor(packagePath: string) {
    try {
      const packageContent = getPackageJson(path.dirname(packagePath));
      const result = await packageProcessor(packageContent, packagePath);
      if (typeof result !== 'object')
        return {
          success: true,
          result,
        };
      if (writeFile) {
        writePrettyFile(
          packagePath,
          prettyFormatPackage(result, prettyFormatOptions),
        );
      } else if (!checkPackageFormat(result, prettyFormatOptions)) {
        console.error(
          chalk.red(
            `${
              unicodeEmoji.error
            } Package format is invalid, run quality with --fix to correct: ${path.relative(
              process.cwd(),
              packagePath,
            )}`,
          ),
        );
        return {
          success: false,
          result,
        };
      }

      return {
        success: true,
        result,
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
      lernaPackageFiles.map((packagePath) => processor(packagePath)),
    );
    return packageChecks.reduce(
      (allSuccessful, result) =>
        allSuccessful && result.status === 'fulfilled' && result.value.success,
      true,
    );
  }

  return processor(path.join(process.cwd(), 'package.json'));
}
