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
import merge from 'lodash/merge';
import { PackageJson } from 'type-fest';

import generateIcons from '../ts-carbon-icons/generator';
import generateFileTypes from '../ts-file-types/generator';
import { FileTypesGeneratorSchema } from '../ts-file-types/schema';
import generateConfig from '../ts-node-config/generator';

function updateProjectConfig(tree: Tree, projectName: string) {
  const lintTarget = {
    executor: '@tablecheck/nx:quality',
    outputs: ['{options.outputFile}'],
    options: {
      lintFilePatterns: [
        '{projectRoot}/src/**/*.ts',
        '{projectRoot}/src/**/*.tsx',
        '{projectRoot}/src/**/*.js',
        '{projectRoot}/src/**/*.jsx',
      ],
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
    updateJson(tree, 'package.json', (json: PackageJson) => {
      if (!json.nx) {
        console.error(
          'Failed to detect existing project config, generating new project.json',
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
      const nxNode = json.nx as never as Parameters<
        typeof addProjectConfiguration
      >[2];
      nxNode.targets = nxNode.targets || {};
      nxNode.targets.quality = lintTarget;
      nxNode.targets['quality:format'] = lintFormatTarget;
      return json;
    });
  }
}

function getLatestVersion(dependency: string) {
  return execSync(`npm show ${dependency} version`).toString().trim();
}

function getLatestVersions(dependencies: string[]) {
  return dependencies.reduce(
    (result, dependency) => ({
      ...result,
      [dependency]: getLatestVersion(dependency),
    }),
    {},
  );
}

export async function qualityGenerator(
  tree: Tree,
  schema: FileTypesGeneratorSchema & { project?: string },
) {
  await addDependenciesToPackageJson(
    tree,
    {},
    getLatestVersions([
      'prettier',
      'husky',
      'commitlint',
      '@tablecheck/commitlint-config',
      '@tablecheck/eslint-config',
      '@tablecheck/prettier-config',
    ]),
  )();
  updateJson(tree, 'package.json', (json: PackageJson) => {
    json.scripts.audit = 'tablecheck-frontend-audit';
    json.scripts['audit:ci'] = 'tablecheck-frontend-audit --ci';
    json.scripts.lint = 'nx affected --target=quality && prettier -c .';
    json.scripts.format =
      'nx affected --target=quality:format && prettier -w .';
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
  await generateConfig(tree);
  await generateIcons(tree);
  await generateFileTypes(tree, schema);
  await formatFiles(tree);
}

export default qualityGenerator;
