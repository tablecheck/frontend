import type { Linter } from 'eslint';

import { cypressPreset } from './cypressInternal';

if (!process.env.NODE_ENV) {
  // This check allows us to run linters inside IDE's
  process.env.NODE_ENV = 'development';
}

const { extends: extendPreset, ...config } = cypressPreset;

module.exports = {
  overrides: [
    {
      files: ['**/cypress/**/*', '**/*.{cy,cypress}.{js,jsx,ts,tsx}'],
      ...config,
    },
  ],
} satisfies Linter.Config;
