const baseTests = require('./tests');
const documentation = require('./documentation');
const merge = require('../utils/merge');

module.exports = merge(require('./typescript'), baseTests, {
  files: [
    '**/__fixtures__/**/*',
    '**/*.fixture.{ts,tsx}',
    '**/*.{stories,story}.{ts,tsx}',
    '.storybook/**/*.{ts,tsx}'
  ],
  rules: {
    ...documentation.rules,
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
