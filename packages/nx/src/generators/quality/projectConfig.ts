import * as path from 'path';

import {
  Tree,
  addProjectConfiguration,
  readProjectConfiguration,
  updateProjectConfiguration,
} from '@nx/devkit';
import merge from 'lodash/merge';

import { getNxProjectRoot } from '../../utils/nx';

export function updateProjectConfig(tree: Tree, projectName: string) {
  const { projectSourceRoot, projectRoot } = getNxProjectRoot(
    tree,
    projectName,
  );
  const lintTarget = {
    executor: '@tablecheck/nx:quality',
    outputs: ['{options.outputFile}'],
    options: {
      lintFilePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'].map(
        (pattern) =>
          path.join(
            '{projectRoot}',
            path.relative(projectRoot, path.join(projectSourceRoot, pattern)),
          ),
      ),
    },
    configurations: {
      format: {
        fix: true,
      },
    },
  };
  try {
    const projectConfig = readProjectConfiguration(tree, projectName);
    updateProjectConfiguration(
      tree,
      projectName,
      merge(projectConfig, {
        targets: {
          quality: lintTarget,
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
      },
    });
  }
}
