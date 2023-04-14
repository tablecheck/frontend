module.exports = {
  extends: ['./packages/eslint-config'],
  env: {
    node: true
  },

  overrides: [
    {
      files: ['./packages/codemods/scripts/*.js'],
      rules: {
        'no-case-declarations': 'off',
        'default-case': 'off'
      }
    }
  ],
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true
      }
    ],
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    'no-console': 'off',
    'promise/prefer-await-to-then': 'off',
    'promise/prefer-await-to-callbacks': 'off',
    'promise/catch-or-return': 'off',
    'promise/always-return': 'off',
    'promise/avoid-new': 'off',
    'no-underscore-dangle': 'off'
  }
};