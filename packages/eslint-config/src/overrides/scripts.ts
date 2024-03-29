import type { Linter } from 'eslint';

export const scriptsOverrides: Linter.ConfigOverride = {
  files: ['scripts/**/*'],
  rules: {
    'no-console': 'off',
    'promise/prefer-await-to-then': 'off',
    'promise/prefer-await-to-callbacks': 'off',
    'promise/catch-or-return': 'off',
    'promise/always-return': 'off',
    'promise/avoid-new': 'off',
  },
};
