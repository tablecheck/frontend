import chalk from 'chalk';
import {
  execa as coreExeca,
  execaSync as coreExecaSync,
  CommonOptions,
  Options,
  SyncOptions,
} from 'execa';

import { getArgv } from './argv';

const argv = getArgv();

export const execaOptions: CommonOptions<string> = {
  cwd: process.cwd(),
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit',
  preferLocal: true,
};

function handleVerbose(
  command: string,
  args: readonly string[] = [],
  options?: Options | SyncOptions,
) {
  if (argv.verbose) {
    let env = '';
    const optionsEnv = options?.env;
    if (optionsEnv) {
      env = `${Object.keys(optionsEnv).map(
        (key) => `${key}=${optionsEnv[key]}`,
      )} `;
    }
    console.log(chalk.gray(`\n> ${env}${command} ${args.join(' ')}\n`));
  }
}

export async function execa(
  command: string,
  args: readonly string[] = [],
  options?: Options,
) {
  handleVerbose(command, args, options);
  return await coreExeca(command, args, options);
}

export function execaSync(
  command: string,
  args: readonly string[] = [],
  options?: SyncOptions,
) {
  handleVerbose(command, args, options);
  return coreExecaSync(command, args, options);
}
