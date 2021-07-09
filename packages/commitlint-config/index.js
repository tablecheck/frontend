module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-case': [2, 'never', ['start-case', 'sentence-case']],
    'body-max-line-length': [0]
  }
};
