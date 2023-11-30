import type { Linter } from 'eslint';

export const storybookOverrides: Linter.ConfigOverride = {
  files: [
    '**/__fixtures__/**/*',
    '**/*.fixture.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
    '**/*.{stories,story}.{ts,tsx,js,jsx}',
    '.storybook/**/*.{ts,tsx,js,jsx}',
  ],
  rules: {
    'no-console': 'off',
    'import/no-default-export': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/function-component-definition': 'off',
    'react/jsx-no-constructed-context-values': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react-refresh/only-export-components': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'consistent-return': 'error',
  },
  env: {
    node: true,
  },
};
