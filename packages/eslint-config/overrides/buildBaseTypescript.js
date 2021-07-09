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

module.exports = function buildBaseTypescript(files, rules) {
  if (!project) return {};
  return {
    parser: '@typescript-eslint/parser',
    extends: [
      require.resolve('eslint-config-airbnb-typescript'),
      'plugin:@typescript-eslint/eslint-plugin/eslint-recommended',
      'plugin:@typescript-eslint/eslint-plugin/recommended',
      'plugin:eslint-comments/recommended',
      'plugin:jest/recommended',
      'prettier',
      'plugin:react-hooks/recommended'
    ],

    plugins: [
      '@typescript-eslint',
      'eslint-comments',
      '@emotion',
      'promise',
      'cypress',
      'jest'
    ],
    files,
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx']
      },
      'import/resolver': {
        typescript: {}
      }
    },
    rules: {
      ...rules,
      'no-void': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'default-case': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'error'
    }
  };
};
