import type { CommonOptions } from 'execa';

export const execaOptions: CommonOptions<string> = {
  cwd: process.cwd(),
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit',
  preferLocal: true,
};
