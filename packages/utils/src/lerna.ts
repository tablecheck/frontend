import path from 'path';

import { execa } from 'execa';
import fs from 'fs-extra';

import { paths } from './paths';

async function lernaList(isToposort?: boolean) {
  const args = ['list', '--json', '--all'];
  if (isToposort) {
    args.push('--toposort');
  }
  const lernaListExec = await execa('lerna', args, { cwd: paths.cwd });
  // lerna re-formats package files
  await execa(
    'prettier',
    ['-u', '-w', '--loglevel=warn', 'package.json', '**/package.json'],
    { cwd: paths.cwd }
  );
  if (lernaListExec.exitCode !== 0) {
    throw new Error(lernaListExec.stderr);
  }
  const packages = JSON.parse(lernaListExec.stdout) as { location: string }[];
  return packages.map(({ location }) => location);
}

export function isLerna() {
  const lernaPath = path.resolve(path.join(paths.cwd, 'lerna.json'));
  return fs.existsSync(lernaPath);
}

let cachedLernaPaths: string[];
export async function getLernaPaths() {
  if (cachedLernaPaths) return cachedLernaPaths;
  if (!isLerna()) {
    cachedLernaPaths = [];
  } else {
    cachedLernaPaths = await lernaList(false);
  }
  return cachedLernaPaths;
}

let cachedSortedLernaPaths: string[];
export async function getSortedLernaPaths() {
  if (cachedSortedLernaPaths) return cachedSortedLernaPaths;
  if (!isLerna()) {
    cachedSortedLernaPaths = [];
  } else {
    cachedSortedLernaPaths = await lernaList(true);
  }
  return cachedSortedLernaPaths;
}
