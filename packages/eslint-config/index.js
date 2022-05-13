const path = require('path');

const fs = require('fs-extra');

// Inspired by https://github.com/facebook/create-react-app/tree/next/packages/eslint-config-react-app

if (!process.env.NODE_ENV) {
  // This check allows us to run linters inside IDE's
  process.env.NODE_ENV = 'development';
}

let project;
if (
  fs.existsSync(path.resolve(path.join(process.cwd(), 'tsconfig.eslint.json')))
) {
  // solution for https://github.com/typescript-eslint/typescript-eslint/issues/1192
  // file is built in scripts/utils/configureTypescript.ts
  project = ['./tsconfig.eslint.json'];
} else if (
  fs.existsSync(path.resolve(path.join(process.cwd(), 'tsconfig.json')))
) {
  project = ['./tsconfig.json'];
}

const config = {
  root: true,
  extends: [
    'airbnb',
    'plugin:eslint-comments/recommended',
    'plugin:jest/recommended',
    'prettier',
    'plugin:react-hooks/recommended'
  ],

  plugins: [
    'eslint-comments',
    '@emotion',
    'promise',
    'cypress',
    'jest',
    '@tablecheck'
  ],

  globals: {
    CONFIG: true
  },
  parserOptions: {
    ecmaVersion: 9,
    sourceType: 'module',
    project
  },

  env: {
    node: true,
    jest: true,
    browser: true,
    commonjs: true,
    es6: true
  },

  settings: {
    jest: {
      version: 26
    },
    react: {
      version: '17'
    }
  },

  overrides: [
    require('./overrides/typescript'),
    require('./overrides/typescriptTests'),
    require('./overrides/tests'),
    require('./overrides/cypress'),
    require('./overrides/typescriptDefinitions'),
    require('./overrides/typescriptDocumentation'),
    require('./overrides/scripts'),
    require('./overrides/documentation'),
    require('./overrides/maxLines')
  ],

  rules: {
    ...require('./rules/general'),
    ...require('./rules/react'),
    ...require('./rules/promise'),
    ...require('./rules/emotion')
  }
};

module.exports = config;
