const jestPlugin = require('eslint-plugin-jest');

const testConfig = require('./tests');
const namingConfig = require('../rules/namingConvention');

const merge = require('../utils/merge');

const testOverrides = Object.keys(testConfig.rules).reduce(
  (result, ruleKey) => ({ ...result, [ruleKey]: 'off' }),
  {}
);

const jestOverrides = Object.keys(jestPlugin.configs.all.rules).reduce(
  (result, ruleKey) => ({ ...result, [ruleKey]: 'off' }),
  {}
);

module.exports = merge(require('./typescript'), {
  files: ['**/cypress/**/*', '**/*.cypress.ts', '**/*.cypress.tsx'],
  parserOptions: {
    ecmaVersion: 9,
    sourceType: 'module',
    project: ['./cypress/tsconfig.json']
  },
  env: {
    'cypress/globals': true
  },
  rules: {
    ...jestOverrides,
    ...testOverrides,
    'promise/catch-or-return': 'off',
    'promise/always-return': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/naming-convention': [].concat(
      namingConfig['@typescript-eslint/naming-convention'],
      [
        {
          selector: 'memberLike',
          format: null
        }
      ]
    )
  }
});
