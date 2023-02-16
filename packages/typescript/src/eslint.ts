import path from 'path';

import {
  getSortedLernaPaths,
  paths,
  userConfig
} from '@tablecheck/frontend-utils';
import fs from 'fs-extra';

import { writeTsConfig } from './writeConfig.js';

export async function configureEslintTypescript(definitionPaths?: string[]) {
  const eslintConfigPath = path.join(paths.cwd, 'tsconfig.eslint.json');
  const eslintRoots = userConfig.additionalRoots || [];
  const lernaPaths = await getSortedLernaPaths();
  if (fs.existsSync(paths.storybook)) {
    eslintRoots.push('.storybook');
  }
  if (fs.existsSync(paths.cypress)) {
    eslintRoots.push('cypress');
  }
  if (lernaPaths.length) {
    lernaPaths.forEach((localPath) => {
      eslintRoots.push(localPath);
    });
  } else {
    eslintRoots.push('src');
  }
  writeTsConfig(
    eslintConfigPath,
    {
      extends: '@tablecheck/scripts/tsconfig/base.json',
      exclude: ['node_modules'],
      include: eslintRoots,
      compilerOptions: {
        isolatedModules: false,
        types: eslintRoots.includes('cypress')
          ? ['cypress', 'node']
          : undefined,
        paths: {
          // this let's us import cypress files from an absolute path in our component tests
          '#cypress/*': ['../cypress/*']
        }
      }
    },
    { definitionPaths }
  );
}
