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
import dotenv from 'dotenv';

const argv = getArgv();

const nodeConfigTypesFilePath = path.join(paths.systemCache, 'nodeConfig.d.ts');

export function generateViteEnvTypes(): string | undefined | void {
  const packageJsonPath = detectInstalledVersion('vite');
  if (!packageJsonPath) return;
  const envFilePath = path.join(paths.cwd, '.env');
  if (!fs.existsSync(envFilePath)) return;
  logTaskStart(`Generating types for '.env' files in vite`);
  const envVars = dotenv.parse(fs.readFileSync(envFilePath));

  writePrettyFile(
    nodeConfigTypesFilePath,
    `/// <reference types="vite/client" />
// this file is autobuilt inside configureTypescript, all changes here will be overwritten

interface ImportMetaEnv {
    ${Object.keys(envVars)
      .filter((key) => key.match(/^VITE_/g))
      .map(
        (key) => `/**
      * Development value: "${envVars[key]}"
      */
     readonly ${key}: string;`
      )}
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
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
