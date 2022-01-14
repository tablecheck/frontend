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

/**
 * typescript specific overrides for enabled eslint rules.
 * Make sure to keep the typescript + eslint rules paired and commented.
 */
const eslintTypescriptRules = {
  // unused variables
  '@typescript-eslint/no-unused-vars': 'error',
  'no-void': 'off',
  'no-unused-vars': 'off',

  // switch...case statements
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  'default-case': 'off',

  // returning value from function
  // see https://stackoverflow.com/a/67652059/1413689
  'consistent-return': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'error'
};

/**
 *
 * @param files - file globs
 * @param rules - here should be the basic rules
 * @param forcedRules - this is the place to override any ts rules
 * @returns eslint-config
 */
module.exports = function buildBaseTypescript(files, rules, forcedRules) {
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
      ...eslintTypescriptRules,
      '@typescript-eslint/no-explicit-any': 'error',
      ...forcedRules
    }
  };
};
