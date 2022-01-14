const buildBaseTypescript = require('./buildBaseTypescript');

module.exports = buildBaseTypescript(
  ['**/*.d.ts'],
  {
    ...require('../rules/general'),
    ...require('../rules/react'),
    ...require('../rules/promise'),
    ...require('../rules/emotion')
  },
  {
    'import/no-default-export': 'off',
    'vars-on-top': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  }
);
