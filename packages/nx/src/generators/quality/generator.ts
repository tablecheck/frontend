import { execSync } from 'child_process';
import * as path from 'path';

import {
  formatFiles,
  generateFiles,
  addDependenciesToPackageJson,
  Tree,
} from '@nx/devkit';

export async function qualityGenerator(tree: Tree) {
  await addDependenciesToPackageJson(
    tree,
    {},
    {
      prettier: 'latest',
      husky: 'latest',
      commitlint: 'latest',
      '@tablecheck/commitlint-config': 'latest',
      '@tablecheck/eslint-config': 'latest',
      '@tablecheck/prettier-config': 'latest',
    },
  )();
  generateFiles(tree, path.join(__dirname, 'files'), tree.root, {});
  execSync('npx husky install', {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
  await formatFiles(tree);
}

export default qualityGenerator;
