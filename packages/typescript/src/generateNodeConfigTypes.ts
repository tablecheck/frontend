import path from 'path';

import {
  paths,
  logTaskEnd,
  logTaskStart,
  getArgv,
  detectInstalledVersion,
  writePrettyFile
} from '@tablecheck/scripts-utils';
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
  if (!fs.existsSync(defaultConfigFilePath)) return;

  const configJson = fs.readJsonSync(defaultConfigFilePath);

  writePrettyFile(
    nodeConfigTypesFilePath,
    `declare module '@tablecheck/scripts' {
    // this file is autobuilt inside configureTypescript, all changes here will be overwritten
    export interface Config ${buildTypes(configJson)}
  
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

function buildTypes(value: unknown): string {
  if (Array.isArray(value))
    return `(${uniq(value.map((v) => buildTypes(v))).join(' | ')})[]`;
  switch (typeof value) {
    case 'object': {
      if (Array.isArray(value))
        return `readonly (${uniq(value.map((v) => buildTypes(v))).join(
          ' | '
        )})[]`;
      return `{${Object.keys(value as Record<string, unknown>)
        .map(
          (key) =>
            `readonly ${key}: ${buildTypes(
              (value as Record<string, unknown>)[key]
            )};`
        )
        .join('\n')}}`;
    }
    case 'bigint':
      return 'number';
    default:
      return typeof value;
  }
}
