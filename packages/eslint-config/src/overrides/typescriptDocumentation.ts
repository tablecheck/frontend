import { mergeDeep } from '../utils/merge';

import { documentationOverrides } from './documentation';
import { testOverrides } from './tests';
import { typescriptOverrides } from './typescript';

export const typescriptDocumentationOverrides = mergeDeep(
  typescriptOverrides,
  testOverrides,
  {
    files: [
      '**/__fixtures__/**/*',
      '**/*.fixture.{ts,tsx}',
      '**/*.{stories,story}.{ts,tsx}',
      '.storybook/**/*.{ts,tsx}',
    ],
    rules: {
      ...documentationOverrides.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      // here we use the more lenient consistent-return to help prevent weird errors
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'consistent-return': 'error',
    },
    env: {
      node: true,
    },
  },
);
