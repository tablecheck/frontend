import { execSync } from 'child_process';
import * as path from 'path';

import {
  formatFiles,
  generateFiles,
  addDependenciesToPackageJson,
  Tree,
  updateJson,
  addProjectConfiguration,
  readProjectConfiguration,
  updateProjectConfiguration,
} from '@nx/devkit';
import { getNxProjectRoot } from '@tablecheck/frontend-utils';
import merge from 'lodash/merge';
import { PackageJson } from 'type-fest';

import { getLatestVersions } from '../../utils/dependencies';
import generateIcons from '../ts-carbon-icons/generator';
import generateFileTypes from '../ts-file-types/generator';
import { FileTypesGeneratorSchema } from '../ts-file-types/schema';
import generateConfig from '../ts-node-config/generator';

function updateProjectConfig(tree: Tree, projectName: string) {
  const { projectSourceRoot } = getNxProjectRoot(tree, projectName);
  const lintTarget = {
    executor: '@tablecheck/nx:quality',
    outputs: ['{options.outputFile}'],
    options: {
      lintFilePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'].map(
        (pattern) => path.join(projectSourceRoot, pattern),
      ),
    },
  };
  const lintFormatTarget = merge({}, lintTarget, {
    options: {
      fix: true,
    },
  });
  try {
    const projectConfig = readProjectConfiguration(tree, projectName);
    updateProjectConfiguration(
      tree,
      projectName,
      merge(projectConfig, {
        targets: {
          quality: lintTarget,
          'quality:format': lintFormatTarget,
        },
      }),
    );
  } catch (e) {
    console.error(
      'Failed to detect existing project config, generating new project.json to run executors',
      e,
    );
    addProjectConfiguration(tree, projectName, {
      root: '.',
      sourceRoot: 'src',
      targets: {
        quality: lintTarget,
        'quality:format': lintFormatTarget,
      },
    });
  }
}

export async function qualityGenerator(
  tree: Tree,
  schema: FileTypesGeneratorSchema & { project: string },
) {
  await addDependenciesToPackageJson(
    tree,
    {},
    getLatestVersions([
      'prettier',
      'husky',
      'commitlint',
      'eslint',
      '@tablecheck/commitlint-config',
      '@tablecheck/eslint-config',
      '@tablecheck/prettier-config',
    ]),
  )();
  updateJson(tree, 'package.json', (json: PackageJson) => {
    if (!json.scripts) json.scripts = {};
    json.scripts.audit = 'tablecheck-frontend-audit';
    json.scripts['audit:ci'] = 'tablecheck-frontend-audit --ci';
    json.scripts.lint = 'nx affected --target=quality && prettier -c .';
    json.scripts.format =
      'nx affected --target=quality:format && prettier -w --loglevel warn .';
    return json;
  });
  updateProjectConfig(tree, schema.project);
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    path.relative(process.cwd(), tree.root),
    {},
  );
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
