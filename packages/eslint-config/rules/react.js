module.exports = {
  'react/jsx-wrap-multilines': 'off',
  'react/jsx-one-expression-per-line': 'off',
  'react/jsx-props-no-spreading': 'off',
  // handled by @emotion/babel-preset-css-prop
  'react/react-in-jsx-scope': 'off',
  // No jsx extension: https://github.com/facebook/create-react-app/issues/87#issuecomment-234627904
  'react/jsx-filename-extension': 'off',
  // irritating, TS handles this better
  'react/static-property-placement': 'off',
  'react/prop-types': 'off',

  // These cause typing conflicts
  'react/require-default-props': ['off'],
  'react/default-props-match-prop-types': [
    'error',
    { allowRequiredDefaults: true }
  ],

  'react/sort-comp': [
    'error',
    {
      order: [
        'static-methods',
        'instance-variables',
        'lifecycle',
        '/^on.+$/',
        '/^handle.+$/',
        'getters',
        'setters',
        '/^(get|set)(?!(InitialState$|DefaultProps$|ChildContext$)).+$/',
        'everything-else',
        '/^render.+$/',
        'render'
      ]
    }
  ],
  'react/destructuring-assignment': [
    'error',
    'always',
    { ignoreClassFields: true }
  ],
  'react/no-find-dom-node': 'error',
  'react/jsx-fragments': 'error',
  'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
  '@tablecheck/consistent-react-import': 'error'
};
