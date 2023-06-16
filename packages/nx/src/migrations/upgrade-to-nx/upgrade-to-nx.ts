import * as path from 'path';

import { Tree } from '@nx/devkit';
import * as fs from 'fs-extra';

export default function update(host: Tree) {
  const src = path.join(__dirname, 'files', 'pre-commit');
  const dest = path.join(host.root, '.husky', 'pre-commit');
  const oldFile = fs.readFileSync(dest, 'utf-8');
  const newFile = fs.readFileSync(src, 'utf-8');
  console.log(`Updated ${dest}`);
  if (oldFile !== newFile) {
    console.log(`  - old file backed up to ${dest}.old`);
    fs.writeFileSync(`${dest}.old`, oldFile);
  }
  fs.copyFileSync(src, dest);
}
