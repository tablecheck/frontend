import type { Linter } from 'eslint';

import { rootConfigsOverrides } from '../overrides/rootConfigs';
import { scriptsOverrides } from '../overrides/scripts';
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
    {
      files: [
        '**/__fixtures__/**/*',
        '**/*.fixture.{ts,tsx,js,jsx,cts,mts,cjs,mjs}',
        '**/*.{stories,story}.{ts,tsx,js,jsx}',
        '.storybook/**/*.{ts,tsx,js,jsx}',
      ],
      rules: {
        'no-console': 'off',
        'import/no-default-export': 'off',
        'react-hooks/rules-of-hooks': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'react/function-component-definition': 'off',
        'react/jsx-no-constructed-context-values': 'off',
        'react-refresh/only-export-components': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        'consistent-return': 'error',
      },
      env: {
        node: true,
      },
    },
  ],
} satisfies Linter.Config;
