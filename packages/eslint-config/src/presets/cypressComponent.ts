import type { Linter } from 'eslint';

if (!process.env.NODE_ENV) {
  // This check allows us to run linters inside IDE's
  process.env.NODE_ENV = 'development';
}

module.exports = {
  overrides: [
    {
      files: ['**/cypress/**/*', '**/*.{cy,cypress}.{js,jsx,ts,tsx}'],
      extends: ['@tablecheck/eslint-config/preset-cypress'],
    },
  ],
} satisfies Linter.Config;
