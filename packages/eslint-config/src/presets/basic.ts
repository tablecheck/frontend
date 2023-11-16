import type { Linter } from 'eslint';

import { rootConfigsOverrides } from '../overrides/rootConfigs';
import { scriptsOverrides } from '../overrides/scripts';
import { storybookOverrides } from '../overrides/storybook';
import { testOverrides } from '../overrides/tests';
import { emotionRules } from '../rules/emotion';
import { generalRules } from '../rules/general';
import { promiseRules } from '../rules/promise';

if (!process.env.NODE_ENV) {
  // This check allows us to run linters inside IDE's
  process.env.NODE_ENV = 'development';
}

module.exports = {
  extends: ['airbnb', 'plugin:eslint-comments/recommended', 'prettier'],

  plugins: ['eslint-comments', 'promise', '@tablecheck', '@nx', '@emotion'],

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },

  env: {
    node: true,
    browser: true,
    commonjs: true,
    es6: true,
  },

  rules: {
    ...generalRules,
    ...promiseRules,
    ...emotionRules,
  },

  overrides: [
    rootConfigsOverrides,
    scriptsOverrides,
    testOverrides,
    storybookOverrides,
  ],
} satisfies Linter.Config;
