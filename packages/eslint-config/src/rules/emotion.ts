import type { Linter } from 'eslint';

export const emotionRules: Linter.RulesRecord = {
  '@emotion/no-vanilla': 'error',
  '@emotion/import-from-emotion': 'error',
  '@emotion/styled-import': 'error',
  '@emotion/syntax-preference': ['error', 'string'],
  '@emotion/pkg-renaming': 'error',
};
