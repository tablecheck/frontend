import type { Linter } from 'eslint';

import { buildBaseTypescript } from '../overrides/buildBaseTypescript';
import { testOverrides } from '../overrides/tests';
import { emotionRules } from '../rules/emotion';
import { generalRules } from '../rules/general';
import { namingRules } from '../rules/namingConvention';
import { promiseRules } from '../rules/promise';

if (!process.env.NODE_ENV) {
  // This check allows us to run linters inside IDE's
  process.env.NODE_ENV = 'development';
}

module.exports = {
  extends: ['@tablecheck/eslint-config/basic'],
  overrides: [
    buildBaseTypescript({
      files: ['**/*.{ts,tsx,cts,mts}'],
      rules: {
        ...generalRules,
        ...promiseRules,
        ...emotionRules,
        ...namingRules,
        'no-unused-vars': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    }),
    buildBaseTypescript({
      files: ['**/*.d.ts'],
      rules: {
        'import/no-default-export': 'off',
        'vars-on-top': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-empty-interface': 'warn',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
      },
    }),
    buildBaseTypescript({
      files: [
        '**/__mocks__/**/*.{ts,tsx,js,jsx,cjs,mjs,cts,mts}',
        '**/__setup__/**/*.{ts,tsx,js,jsx,cjs,mjs,cts,mts}',
        '**/__tests__/**/*.{ts,tsx,js,jsx,cjs,mjs,cts,mts}',
        '**/__tests__/*.{ts,tsx,js,jsx,cjs,mjs,cts,mts}',
        '**/*.test.{ts,tsx,js,jsx,cjs,mjs,cts,mts}',
        '**/*.spec.{ts,tsx,js,jsx,cjs,mjs,cts,mts}',
      ],
      rules: {
        ...testOverrides.rules,
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        'consistent-return': 'error',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
      env: {
        node: true,
      },
    }),
  ],
} satisfies Linter.Config;
