import { emotionRules } from '../rules/emotion';
import { generalRules } from '../rules/general';
import { promiseRules } from '../rules/promise';
import { reactRules } from '../rules/react';

import { buildBaseTypescript } from './buildBaseTypescript';

export const typescriptDefinitionOverrides = buildBaseTypescript(
  ['**/*.d.ts'],
  {
    ...generalRules,
    ...reactRules,
    ...promiseRules,
    ...emotionRules,
  },
  {
    'import/no-default-export': 'off',
    'vars-on-top': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
);
