import * as path from 'path';

import fs from 'fs-extra';
import {
  format as prettyFormatPackage,
  check as checkPackageFormat,
} from 'prettier-package-json';
import * as semver from 'semver';
import type { PackageJson } from 'type-fest';

import { getArgv } from './argv.js';
import { outputPrettyFile } from './prettier.js';
import { unicodeEmoji } from './unicodeEmoji.js';

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
  const packageJson = fs.readJSONSync(packageJsonPath) as PackageJson;
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
      `${packageName} at version '${packageJson.version}' detected in installed dependencies!`,
    );
  }
  return packageJsonPath;
}

declare module 'type-fest' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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

export async function processPackage({
  packageProcessor,
  shouldWriteFile,
  packageDir,
}: {
  packageDir: string;
  packageProcessor: (
    packageContent: PackageJson,
    filePath: string,
  ) => Promise<PackageJson>;
  shouldWriteFile: boolean;
}) {
  try {
    const packageContent = getPackageJson(packageDir);
    let didSucceed = true;
    let processingError: Error | undefined;
    const result = await packageProcessor(packageContent, packageDir).catch(
      (error) => {
        didSucceed = false;
        processingError = error as Error;
        return packageContent;
      },
    );
    if (shouldWriteFile) {
      await outputPrettyFile(
        path.join(packageDir, 'package.json'),
        prettyFormatPackage(result, prettyFormatOptions),
      );
    } else if (!checkPackageFormat(result, prettyFormatOptions)) {
      console.error(
        `${
          unicodeEmoji.error
        } Package format is invalid, run quality with --fix to correct: ${path.relative(
          process.cwd(),
          packageDir,
        )}/package.json`,
      );
      return {
        success: false,
        error: 'Invalid package format',
      };
    }

    return {
      success: didSucceed,
      error: processingError,
    };
  } catch (error) {
    console.error(
      `Error occurred in processing package ${packageDir}/package.json`,
    );
    console.error(error);
    return { success: false, error: error as Error };
  }
}
