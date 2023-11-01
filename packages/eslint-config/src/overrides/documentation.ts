import type { Linter } from 'eslint';

export const documentationOverrides: Linter.ConfigOverride = {
  files: [
    '**/__fixtures__/**/*',
    '**/*.fixture.{js,jsx,cjs,mjs}',
    '**/*.{stories,story}.{js,jsx,cjs,mjs}',
    '.storybook/**/*.{js,jsx,cjs,mjs}',
  ],
  rules: {
    'no-console': 'off',
    'import/no-default-export': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/function-component-definition': 'off',
    'react/jsx-no-constructed-context-values': 'off',
    'react-refresh/only-export-components': 'off',
  },
};
