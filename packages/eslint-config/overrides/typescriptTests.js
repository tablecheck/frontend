const baseTests = require('./tests');
const merge = require('../utils/merge');

module.exports = merge(require('./typescript'), baseTests, {
  files: [
    '**/__mocks__/**/*.{ts,tsx}',
    '**/__setup__/**/*.{ts,tsx}',
    '**/__tests__/**/*.{ts,tsx}',
    '**/__tests__/*.{ts,tsx}',
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    // here we use the more lenient consistent-return to help prevent weird errors
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'consistent-return': 'error'
  },
  env: {
    jest: true,
    node: true
  }
});
