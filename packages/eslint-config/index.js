const path = require('path');

const fs = require('fs-extra');

// Inspired by https://github.com/facebook/create-react-app/tree/next/packages/eslint-config-react-app

if (!process.env.NODE_ENV) {
  // This check allows us to run linters inside IDE's
  process.env.NODE_ENV = 'development';
}

let reactVersion = '17'; // set to 17 for legacy reasons or to not error if react not present - should be able to detect below
const packageJsonPath = path.resolve(path.join(process.cwd(), 'package.json'));
if (fs.existsSync(packageJsonPath)) {
  const pkg = fs.readJsonSync(packageJsonPath);
  if (pkg.dependencies && pkg.dependencies.react) {
    const versionOnly = pkg.dependencies.react
      .replace(/^[^0-9]+/gi, '')
      .replace(/\..+$/gi, '');
    if (versionOnly === '*')
      reactVersion = '18'; // dumb hack, but using '*' is more dumb
    else if (!isNaN(parseFloat(versionOnly))) reactVersion = versionOnly;
  }
}

const config = {
  root: true,
  extends: [
    'airbnb',
    'plugin:eslint-comments/recommended',
    'prettier',
    'plugin:react-hooks/recommended'
  ],

  plugins: ['eslint-comments', '@emotion', 'promise', 'cypress', '@tablecheck'],

  globals: {
    CONFIG: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },

  env: {
    node: true,
    browser: true,
    commonjs: true,
    es6: true
  },

  settings: {
    react: {
      version: reactVersion
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
    ...require('./overrides/configurable'),
    require('./overrides/rootConfigs')
  ],

  rules: {
    ...require('./rules/general'),
    ...require('./rules/react'),
    ...require('./rules/promise'),
    ...require('./rules/emotion')
  }
};

module.exports = config;
