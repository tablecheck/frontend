import * as path from 'path';

import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  installPackagesTask,
  addDependenciesToPackageJson,
  Tree,
} from '@nx/devkit';
import { execaOptions } from '@tablecheck/frontend-utils';
import { execa } from 'execa';

import { QualityGeneratorSchema } from './schema';

export async function qualityGenerator(
  tree: Tree,
  options: QualityGeneratorSchema,
) {
  const projectRoot = `libs/${options.name}`;
  addProjectConfiguration(tree, options.name, {
    root: projectRoot,
    projectType: 'library',
    sourceRoot: `${projectRoot}/src`,
    targets: {},
  });
  addDependenciesToPackageJson(
    tree,
    {},
    {
      prettier: 'latest',
      husky: 'latest',
      commitlint: 'latest',
      '@tablecheck/commitlint-config': 'latest',
      '@tablecheck/eslint-config': 'latest',
    },
  );
  installPackagesTask(tree, true, projectRoot, 'npm');
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await execa('npx', ['husky', 'install'], execaOptions);
  await formatFiles(tree);
}

export default qualityGenerator;
