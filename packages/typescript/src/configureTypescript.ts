import path from 'path';

import {
  paths,
  getArgv,
  getSortedLernaPaths,
  userConfig,
} from '@tablecheck/frontend-utils';
import chalk from 'chalk';
import fs from 'fs-extra';
import { TsConfigJson } from 'type-fest';

import { writeTsConfig, WriteTsConfigOptions } from './writeConfig.js';
import { configureCypressTypescript } from './cypress.js';
import { configureEslintTypescript } from './eslint.js';

const argv = getArgv();

const isManual = userConfig.typescript === 'manual';

type PartialTsConfigJson<TKeys extends keyof TsConfigJson> = Required<
  Pick<TsConfigJson, TKeys>
> &
  Omit<TsConfigJson, TKeys>;

export async function configureTypescript({
  isBuild = true,
  shouldCleanLibs = false,
  shouldIgnorePackageArg = false,
  definitionPaths,
}: {
  isBuild?: boolean;
  shouldCleanLibs?: boolean;
  shouldIgnorePackageArg?: boolean;
  definitionPaths?: string[];
}) {
  const packageFilter = shouldIgnorePackageArg ? '*' : argv.package;
  const lernaPaths = await getSortedLernaPaths();
  const runnerConfigPath = path.join(paths.cwd, 'tsconfig.json');
  const baseTypescriptConfigPath = path.join(
    paths.systemDir,
    'typescript/tsconfig/base.json',
  );
  const packageConfig: PartialTsConfigJson<
    'extends' | 'include' | 'compilerOptions'
  > = {
    extends: baseTypescriptConfigPath,
    include: ['src', '*.ts'],
    compilerOptions: {
      rootDir: '.',
      baseUrl: './src',
      composite: false,
    },
  };
  if (fs.existsSync(paths.storybook)) {
    packageConfig.include.push('.storybook');
  }
  // depending on whether we are in a lerna mono-repo or not we can either use
  // the above packageConfig on it's own or use this one and reference the other
  let libConfig: PartialTsConfigJson<'extends' | 'include' | 'references'> = {
    extends: baseTypescriptConfigPath,
    include: ['*.ts'], // include config files like vite.config.ts
    references: [],
  };
  const sharedWriteConfigOpts: WriteTsConfigOptions = {
    excludeTests: isBuild,
    definitionPaths,
  };
  const eslintConfig = {
    ...packageConfig,
    compilerOptions: {
      ...packageConfig.compilerOptions,
      composite: true,
    },
  };
  if (lernaPaths.length) {
    const references = [] as NonNullable<TsConfigJson['references']>;
    lernaPaths.forEach((localPath) => {
      if (packageFilter && packageFilter !== '*') {
        if (localPath.split('/').slice(-1)[0] !== packageFilter) return;
      }
      const esmConfigPath = path.relative(
        process.cwd(),
        path.join(localPath, `tsconfig.json`),
      );
      const globalConfigPath = path.relative(
        process.cwd(),
        path.join(localPath, `tsconfig.compound.json`),
      );
      if (!isManual) {
        writeTsConfig(esmConfigPath, packageConfig, sharedWriteConfigOpts);
      }
      if (
        !writeTsConfig(globalConfigPath, eslintConfig, sharedWriteConfigOpts)
      ) {
        return;
      }
      references.push({
        path: globalConfigPath,
      });
    });
    if (!isBuild && references.length === 1) {
      libConfig = fs.readJSONSync(references[0].path) as typeof libConfig;
    } else {
      libConfig.references = references;
    }
    if (shouldCleanLibs) {
      if (argv.verbose) {
        console.log(chalk.gray('\nCleaning `lib` folders:'));
      }
      lernaPaths.forEach((refPath) => {
        if (packageFilter && packageFilter !== '*') {
          if (refPath.split('/').slice(-1)[0] !== packageFilter) return;
        }
        if (argv.verbose) {
          console.log(chalk.gray(`  ${refPath}`));
        }
        fs.emptyDirSync(path.join(refPath, 'lib'));
      });
    }
    if (isManual && !fs.existsSync(runnerConfigPath)) {
      throw new Error(
        `Typescript has been set to manual but there is no tsconfig.json at ${runnerConfigPath}`,
      );
    }
    if (isManual) return runnerConfigPath;
    if (
      !writeTsConfig(runnerConfigPath, libConfig, {
        ...sharedWriteConfigOpts,
        forceConfig: true,
      })
    ) {
      throw new Error('This project is not written in typescript');
    }
    return runnerConfigPath;
  }

  if (!writeTsConfig(runnerConfigPath, packageConfig, sharedWriteConfigOpts)) {
    throw new Error('This project is not written in typescript');
  }
  if (shouldCleanLibs) {
    if (argv.verbose) {
      console.log(chalk.gray('\nCleaning `lib` folders:'));
    }
    fs.emptyDirSync(path.join(paths.cwd, 'lib'));
  }
  await configureEslintTypescript(definitionPaths);
  await configureCypressTypescript(definitionPaths);
  return runnerConfigPath;
}
