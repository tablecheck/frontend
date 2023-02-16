import path from 'path';

import {
  paths,
  logTaskEnd,
  logTaskStart,
  getArgv,
  detectInstalledVersion,
  writePrettyFile
} from '@tablecheck/frontend-utils';
import chalk from 'chalk';
import fs from 'fs-extra';
import _ from 'lodash';

const { uniq } = _;

const argv = getArgv();

const nodeConfigTypesFilePath = path.join(paths.systemCache, 'nodeConfig.d.ts');

export function generateNodeConfigTypes(): string | undefined | void {
  const packageJsonPath = detectInstalledVersion('config');
  if (!packageJsonPath) return;
  logTaskStart(`Generating types for 'config' ('node-config')`);

  const defaultConfigFilePath = path.join(paths.cwd, 'config/default.json');
  const devConfigFilePath = path.join(paths.cwd, 'config/development.json');
  if (!fs.existsSync(defaultConfigFilePath)) return;

  const defaultConfigJson = fs.readJsonSync(defaultConfigFilePath);
  const devConfigJson = fs.existsSync(devConfigFilePath)
    ? fs.readJSONSync(devConfigFilePath)
    : {};

  writePrettyFile(
    nodeConfigTypesFilePath,
    `declare module '@tablecheck/scripts' {
    // this file is autobuilt inside configureTypescript, all changes here will be overwritten
    interface DefaultConfig ${buildTypes(defaultConfigJson)}
    export interface Config extends DefaultConfig ${buildTypes(devConfigJson)}
  
    global {
      const CONFIG: Config;
    }
  }`
  );

  logTaskEnd(true);
  if (argv.verbose) {
    console.log('');
    console.log(chalk.gray(path.relative(paths.cwd, nodeConfigTypesFilePath)));
    console.log(chalk.gray(fs.readFileSync(nodeConfigTypesFilePath, 'utf8')));
  }
  return nodeConfigTypesFilePath;
}

function buildTypes(configValue: unknown): string {
  if (Array.isArray(configValue))
    return `(${uniq(configValue.map((v, i) => buildTypes(v))).join(' | ')})[]`;
  switch (typeof configValue) {
    case 'object': {
      if (Array.isArray(configValue))
        return `readonly (${uniq(configValue.map((v) => buildTypes(v))).join(
          ' | '
        )})[]`;
      return `{${Object.keys(configValue as Record<string, unknown>)
        .map(
          (key) =>
            `readonly ${key}: ${buildTypes(
              (configValue as Record<string, unknown>)[key]
            )};`
        )
        .join('\n')}}`;
    }
    case 'bigint':
      return 'number';
    default:
      return typeof configValue;
  }
}
