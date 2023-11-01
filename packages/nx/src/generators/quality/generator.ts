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

import { getLatestVersions } from '../../utils/dependencies';
import generateIcons from '../ts-carbon-icons/generator';
import generateFileTypes from '../ts-file-types/generator';
import { FileTypesGeneratorSchema } from '../ts-file-types/schema';
import generateConfig from '../ts-node-config/generator';

import { generateEslintConfig } from './eslintConfig';
import { updateProjectConfig } from './projectConfig';

export async function qualityGenerator(
  tree: Tree,
  schema: FileTypesGeneratorSchema & Parameters<typeof generateEslintConfig>[1],
) {
  await addDependenciesToPackageJson(
    tree,
    {},
    getLatestVersions([
      'prettier',
      'husky',
      'commitlint',
      'eslint',
      '@tablecheck/frontend-audit',
      '@tablecheck/commitlint-config',
      '@tablecheck/eslint-config',
      '@tablecheck/prettier-config',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
    ]),
  )();
  updateJson(tree, 'package.json', (json: PackageJson) => {
    if (!json.scripts) json.scripts = {};
    json.scripts.audit = 'tablecheck-frontend-audit';
    json.scripts['audit:ci'] = 'tablecheck-frontend-audit --ci';
    json.scripts.lint = 'nx affected --target=quality && prettier -c .';
    json.scripts.format =
      'nx affected --target=quality:format && prettier -w --loglevel warn .';
    json.scripts.prepare = 'husky install';
    json.type = 'module';
    return json;
  });
  updateProjectConfig(tree, schema.project);
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    path.relative(process.cwd(), tree.root),
    {},
  );
  generateEslintConfig(tree, schema);
  execSync('npx husky install', {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
  generateConfig(tree, schema);
  generateIcons(tree, schema);
  await generateFileTypes(tree, schema);
  await formatFiles(tree);
}

export default qualityGenerator;
