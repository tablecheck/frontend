module.exports = {
  files: [
    '**/__fixtures__/**/*',
    '**/*.fixture.{js,jsx}',
    '**/*.{stories,story}.{js,jsx}',
    '.storybook/**/*.{js,jsx}'
  ],
  rules: {
    'no-console': 'off',
    'import/no-default-export': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    '@tablecheck/max-mixed-css': 'off',
    'react/function-component-definition': 'off',
    'react/jsx-no-constructed-context-values': 'off'
  }
};
