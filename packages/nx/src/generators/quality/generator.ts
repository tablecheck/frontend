import * as path from 'path';

import {
  formatFiles,
  generateFiles,
  addDependenciesToPackageJson,
  runExecutor,
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
  await runExecutor(
    {
      project: tree.root,
      target: 'nx:run-commands',
    },
    {
      command: 'npx husky install',
    },
    {
      cwd: process.cwd(),
      root: tree.root,
      isVerbose: false,
    },
  );
  await formatFiles(tree);
}

export default qualityGenerator;
