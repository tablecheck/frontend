import path from 'path';

import { paths, getArgv } from '@tablecheck/frontend-utils';
import chalk from 'chalk';
import fs from 'fs-extra';
import glob from 'glob';
import { TsConfigJson } from 'type-fest';
import { outputTsConfig } from './utils.js';

const argv = getArgv();

export interface WriteTsConfigOptions {
  forceConfig?: boolean;
  definitionPaths?: string[];
  excludeTests?: boolean;
}

export function writeTsConfig(
  filePath: string,
  configArg: TsConfigJson,
  { forceConfig, definitionPaths, excludeTests }: WriteTsConfigOptions
) {
  let sourceFiles: string[] = [];
  const config = {
    ...configArg,
    include: configArg.include ? [...configArg.include] : undefined,
    exclude: excludeTests
      ? [
          'node_modules',
          '**/*.cypress.ts',
          '**/*.cypress.tsx',
          '**/*.cy.ts',
          '**/*.cy.tsx',
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/__tests__/**/*',
          '**/__tests__/*'
        ]
      : ['node_modules'],
    files: (definitionPaths || []).filter((filepath) => fs.existsSync(filepath))
  };
  if (config.include) {
    if (argv.verbose) {
      console.log(
        chalk.gray('\nChecking for source files in following paths;')
      );
    }
    config.include = config.include.reduce((mappedIncludes, globOrFolder) => {
      if (
        globOrFolder.indexOf('.') === -1 ||
        globOrFolder.indexOf('*') === -1
      ) {
        return mappedIncludes.concat(
          ['**/*.ts', '**/*.tsx', '*.ts', '*.tsx', '**/*.json', '*.json'].map(
            (extension) => path.join(globOrFolder, extension)
          )
        );
      }
      return mappedIncludes.concat([globOrFolder]);
    }, [] as string[]);
    config.include.forEach((globOrFolder) => {
      const matchedFiles = glob.sync(globOrFolder, {
        cwd: path.resolve(filePath, '..'),
        silent: true
      });
      sourceFiles = sourceFiles.concat(matchedFiles);
    });
    sourceFiles = sourceFiles.filter(
      (fileFilter) => !fileFilter.match(/\/lib\//)
    );
  }
  if (!forceConfig && !sourceFiles.length) {
    if (argv.verbose) {
      console.log(
        chalk.gray(
          `\nSkip Typescript config due to no ts, tsx files @ ${path.relative(
            paths.cwd,
            filePath
          )}`
        )
      );
    }
    return false;
  }
  outputTsConfig(config, filePath);
  return true;
}
