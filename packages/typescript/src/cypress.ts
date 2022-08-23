import path from 'path';

import { paths } from '@tablecheck/scripts-utils';

import { writeTsConfig } from './writeConfig.js';
import { addConfigAsReference } from './utils.js';

export async function configureCypressTypescript(definitionPaths?: string[]) {
  const cypressPath = path.join(paths.cypress, 'tsconfig.json');
  addConfigAsReference(cypressPath);
  writeTsConfig(
    cypressPath,
    {
      extends: '@tablecheck/scripts/tsconfig/base.json',
      exclude: ['node_modules'],
      include: [
        '**/*.ts',
        '**/*.tsx',
        '../src/**/*.cy.tsx',
        '../src/**/*.cy.ts',
        '../src/definitions/**/*.ts'
      ],
      compilerOptions: {
        composite: true,
        baseUrl: '../src',
        lib: ['dom', 'dom.iterable', 'esnext'],
        module: 'esnext',
        noEmit: false,
        target: 'es5',
        types: ['cypress', 'node'],
        isolatedModules: false,
        // this let's us import cypress files from an absolute path in our component tests
        paths: { '#cypress/*': ['../cypress/*'] }
      }
    },
    { definitionPaths }
  );
}
