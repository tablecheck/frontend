import * as path from 'path';

import {
  formatFiles,
  generateFiles,
  addDependenciesToPackageJson,
  Tree,
} from '@nx/devkit';

export async function qualityGenerator(tree: Tree) {
  const { execa } = await import('execa');
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
  await execa('npx', ['husky', 'install'], {
    cwd: process.cwd(),
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
    preferLocal: true,
  });
  await formatFiles(tree);
}

export default qualityGenerator;
