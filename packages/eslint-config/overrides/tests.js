module.exports = {
  files: [
    '**/__mocks__/**/*.{js,jsx}',
    '**/__setup__/**/*.{js,jsx}',
    '**/__tests__/**/*.{js,jsx}',
    '**/__tests__/*.{js,jsx}',
    '**/*.test.{js,jsx}',
    '**/*.spec.{js,jsx}'
  ],
  rules: {
    // jest specific rules
    'jest/consistent-test-it': [
      'error',
      { fn: 'test', withinDescribe: 'test' }
    ],
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'error',
    'jest/prefer-to-be': 'error',
    'jest/valid-describe-callback': 'error',
    'jest/valid-expect': 'error',
    // technically this is in the recommended that we extend, but we need to turn it off for tc-react-system
    'jest/no-jest-import': 'error',

    // overrides not necessary for test files
    'promise/prefer-await-to-then': 'error',
    'promise/prefer-await-to-callbacks': 'error',
    'promise/avoid-new': 'off',
    'func-names': 'off',
    'no-new': 'off',
    'class-methods-use-this': 'off',
    'prefer-promise-reject-errors': 'off',
    'global-require': 'off',
    'react/prop-types': 'off',

    'jsx-a11y/accessible-emoji': 'off',
    'jsx-a11y/alt-text': 'off',
    'jsx-a11y/anchor-has-content': 'off',
    'jsx-a11y/aria-activedescendant-has-tabindex': 'off',
    'jsx-a11y/aria-props': 'off',
    'jsx-a11y/aria-proptypes': 'off',
    'jsx-a11y/aria-role': 'off',
    'jsx-a11y/aria-unsupported-elements': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/heading-has-content': 'off',
    'jsx-a11y/html-has-lang': 'off',
    'jsx-a11y/iframe-has-title': 'off',
    'jsx-a11y/img-redundant-alt': 'off',
    'jsx-a11y/interactive-supports-focus': 'off',
    'jsx-a11y/label-has-for': 'off',
    'jsx-a11y/media-has-caption': 'off',
    'jsx-a11y/mouse-events-have-key-events': 'off',
    'jsx-a11y/no-access-key': 'off',
    'jsx-a11y/no-autofocus': 'off',
    'jsx-a11y/no-distracting-elements': 'off',
    'jsx-a11y/no-interactive-element-to-noninteractive-role': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'jsx-a11y/no-noninteractive-element-to-interactive-role': 'off',
    'jsx-a11y/no-noninteractive-tabindex': 'off',
    'jsx-a11y/no-onchange': 'off',
    'jsx-a11y/no-redundant-roles': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/role-has-required-aria-props': 'off',
    'jsx-a11y/role-supports-aria-props': 'off',
    'jsx-a11y/scope': 'off',
    'jsx-a11y/tabindex-no-positive': 'off',
    camelcase: 'error'
  },
  env: {
    jest: true,
    node: true
  }
};
