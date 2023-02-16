import path from 'path';

import {
  paths,
  getPackageJson,
  getArgv,
  writePrettyFile
} from '@tablecheck/frontend-utils';
import fs from 'fs-extra';
import { TsConfigJson } from 'type-fest';
import chalk from 'chalk';

const argv = getArgv();

export const mainProjectReferenceName = 'tsconfig.main.json';
1;

export function isLibTypeDefinitions(directory: string) {
  const packageJson = getPackageJson(directory);
  if (packageJson.name?.match(/^@types\//)) return true;
  if (
    packageJson.keywords &&
    packageJson.keywords.indexOf('typescript-definitions') > -1
  ) {
    return true;
  }
  return false;
}

export function getTsConfig() {
  const tsConfigPath = path.join(paths.cwd, 'tsconfig.json');
  if (!fs.existsSync(tsConfigPath))
    throw new Error(`No tsconfig.json detected at ${tsConfigPath}`);
  return fs.readJSONSync(tsConfigPath) as TsConfigJson;
}

export function outputTsConfig(
  config: TsConfigJson,
  filePath = path.join(paths.cwd, 'tsconfig.json')
) {
  writePrettyFile(filePath, JSON.stringify(config));
  if (argv.verbose) {
    console.log(
      chalk.gray(
        `\nSet Typescript Config @ ${path.relative(paths.cwd, filePath)}`
      )
    );
    console.log(chalk.gray(`\n${fs.readFileSync(filePath)}`));
  }
}

export function addConfigAsReference(newConfigPath: string) {
  const tsConfig = getTsConfig();
  if (!tsConfig.references) {
    const mainConfigPath = path.join(paths.cwd, mainProjectReferenceName);
    outputTsConfig(tsConfig, mainConfigPath);
    outputTsConfig({
      extends: '@tablecheck/scripts/tsconfig/base.json',
      include: [],
      references: [{ path: newConfigPath }, { path: mainConfigPath }]
    });
  } else if (!tsConfig.references?.find((ref) => ref.path === newConfigPath)) {
    tsConfig.references.push({ path: newConfigPath });
    outputTsConfig(tsConfig);
  }
}
