module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-case': [2, 'never', ['sentence-case']],
    'body-max-line-length': [0],
  },
};
