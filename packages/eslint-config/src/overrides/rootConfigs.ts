import type { Linter } from 'eslint';

export const rootConfigsOverrides: Linter.ConfigOverride = {
  files: ['./*.{js,ts,mjs}'],
  rules: {
    'no-console': 'off',
    'import/no-default-export': 'off',
  },
};
