import { Linter } from 'eslint';

import { namingRules } from '../rules/namingConvention';
import { mergeDeep as merge } from '../utils/merge';

import { testOverrides as testRules } from './tests';
import { typescriptOverrides } from './typescript';

const testOverrides = Object.keys(testRules.rules).reduce(
  (result, ruleKey) => ({ ...result, [ruleKey]: 'off' }),
  {},
);

export const cypressOverrides: Linter.ConfigOverride = typescriptOverrides
  ? merge(typescriptOverrides, {
      files: ['**/cypress/**/*', '**/*.cypress.ts', '**/*.cypress.tsx'],
      parserOptions: {
        ecmaVersion: 9,
        sourceType: 'module',
        // defining both of these to prevent a bug in precommit staged linter from failing in some cases
        project: ['./cypress/tsconfig.json', './tsconfig.json'],
      },
      env: {
        'cypress/globals': true,
      },
      rules: {
        ...testOverrides,
        'promise/catch-or-return': 'off',
        'promise/always-return': 'off',
        'import/no-import-module-exports': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/naming-convention': (
          ['error'] as Linter.RuleLevelAndOptions
        ).concat(
          (
            namingRules[
              '@typescript-eslint/naming-convention'
            ] as Linter.RuleLevelAndOptions
          ).slice(1),
          [
            {
              selector: 'memberLike',
              format: null,
            },
          ],
        ) as Linter.RuleLevelAndOptions,
      },
    })
  : undefined;
