import path from 'path';

import fs from 'fs-extra';
import glob from 'glob';

export function isLerna() {
  const lernaPath = path.resolve(path.join(process.cwd(), 'lerna.json'));
  return fs.existsSync(lernaPath);
}

function lernaList(): string[] {
  const lernaConfig = fs.readJSONSync(path.join(process.cwd(), 'lerna.json'));
  const packages = lernaConfig.packages || [];
  return packages.reduce((acc: string[], pattern: string) => {
    return acc.concat(glob.sync(pattern, { cwd: process.cwd() }));
  }, [] as string[]);
}

let cachedLernaPaths: string[];
export async function getLernaPaths() {
  if (cachedLernaPaths) return cachedLernaPaths;
  if (!isLerna()) {
    cachedLernaPaths = [];
  } else {
    cachedLernaPaths = await lernaList();
  }
  return cachedLernaPaths;
}
