import { execSync } from 'child_process';
import * as path from 'path';

import {
  formatFiles,
  generateFiles,
  addDependenciesToPackageJson,
  Tree,
  updateJson,
} from '@nx/devkit';
import { PackageJson } from 'type-fest';

import generateIcons from '../ts-carbon-icons/generator';
import generateFileTypes from '../ts-file-types/generator';
import { FileTypesGeneratorSchema } from '../ts-file-types/schema';
import generateConfig from '../ts-node-config/generator';

export async function qualityGenerator(
  tree: Tree,
  schema: FileTypesGeneratorSchema,
) {
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
  updateJson(tree, 'package.json', (json: PackageJson) => {
    json.scripts['generate:carbon-icons'] =
      'nx generate @tablecheck/nx:ts-carbon-icons';
    json.scripts['generate:node-config'] =
      'nx generate @tablecheck/nx:ts-node-config';
    return json;
  });
  generateFiles(tree, path.join(__dirname, 'files'), tree.root, {});
  execSync('npx husky install', {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
  await generateConfig(tree);
  await generateIcons(tree);
  await generateFileTypes(tree, schema);
  await formatFiles(tree);
}

export default qualityGenerator;
