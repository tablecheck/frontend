import type { Linter } from 'eslint';

export const rootConfigsOverrides: Linter.ConfigOverride = {
  files: ['./*.{js,mjs,cjs,ts,cts,mts}', '*.config.{js,mjs,cjs,ts,cts,mts}'],
  rules: {
    'no-console': 'off',
    'import/no-default-export': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
  },
};
