import { mergeDeep } from '../utils/merge';

import { testOverrides } from './tests';
import { typescriptOverrides } from './typescript';

export const typescriptTestsOverrides = typescriptOverrides
  ? mergeDeep(typescriptOverrides, testOverrides, {
      files: [
        '**/__mocks__/**/*.{ts,tsx}',
        '**/__setup__/**/*.{ts,tsx}',
        '**/__tests__/**/*.{ts,tsx}',
        '**/__tests__/*.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        // here we use the more lenient consistent-return to help prevent weird errors
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'consistent-return': 'error',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
      env: {
        node: true,
      },
    })
  : undefined;
