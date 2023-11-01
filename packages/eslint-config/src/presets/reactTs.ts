import type { Linter } from 'eslint';

if (!process.env.NODE_ENV) {
  // This check allows us to run linters inside IDE's
  process.env.NODE_ENV = 'development';
}

module.exports = {
  extends: [
    '@tablecheck/eslint-config/preset-typescript',
    '@tablecheck/eslint-config/preset-react',
  ],
} satisfies Linter.Config;
