import type { Linter } from 'eslint';

import { storybookOverrides } from '../overrides/storybook';

if (!process.env.NODE_ENV) {
  // This check allows us to run linters inside IDE's
  process.env.NODE_ENV = 'development';
}

module.exports = {
  overrides: [
    {
      extends: ['@tablecheck/eslint-config/typescript'],
      ...storybookOverrides,
    },
  ],
} satisfies Linter.Config;
