module.exports = {
  extends: ['@tablecheck/eslint-config']
};

// this project is NOT typescript compatible - make sure this matches the eslint-config setup
// basically nothing this requires actually has types or they make no sense
// this is the only project that should not be in typescript.
module.exports = {
  extends: [
    'airbnb',
    'plugin:eslint-comments/recommended',
    'plugin:jest/recommended',
    'prettier'
  ],
  plugins: ['eslint-comments', 'jest', 'promise'],
  env: {
    node: true,
    jest: true
  },

  settings: {
    jest: {
      version: 26
    }
  },
  overrides: [
    require('@tablecheck/eslint-config/overrides/tests'),
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
    'no-underscore-dangle': 'off',
    // use immer.produce for safety
    'no-param-reassign': 'off'
  }
};
