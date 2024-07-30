import type { Linter } from 'eslint';

export const generalRules: Linter.RulesRecord = {
  'max-lines': [
    'error',
    { max: 500, skipBlankLines: true, skipComments: true },
  ],
  'no-continue': 'off',
  // https://github.com/babel/babel-eslint/issues/815
  'template-curly-spacing': 'off',
  'no-underscore-dangle': 'off',
  'class-methods-use-this': 'off',
  'func-style': ['error', 'declaration', { allowArrowFunctions: true }],

  'import/no-extraneous-dependencies': [
    'error',
    {
      // devDeps is fine - to bundle the apps we need these anyway
      // this will realistically only affect libs like tablekit and this package
      devDependencies: true,
    },
  ],
  'import/newline-after-import': 'error',
  'import/order': 'off',
  'simple-import-sort/imports': [
    'error',
    {
      groups: [
        // Node.js builtins.
        [
          '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
        ],
        // Packages. `react` related packages come first.
        ['^react', '^@?\\w'],
        // Internal packages.
        ['^(@|@local|~)(/.*|$)'],
        // Side effect imports.
        ['^\\u0000'],
        // Parent imports. Put `..` last.
        ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
        // Other relative imports. Put same-folder imports and `.` last.
        ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
        // Style imports.
        ['^.+\\.s?css$'],
      ],
    },
  ],
  'simple-import-sort/exports': 'error',
  'import/first': 'error',
  'import/no-duplicates': 'error',
  // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
  'import/prefer-default-export': 'off',
  'import/no-default-export': 'error',
  'import/no-import-module-exports': [
    'error',
    {
      exceptions: [
        '**/*/client.standalone.tsx',
        '**/*/client.standalone.ts',
        '**/*/client.standalone.js',
        '**/*/client.standalone.jsx',
      ],
    },
  ],

  'no-restricted-syntax': [
    'error',
    {
      selector: 'ForInStatement',
      message:
        'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
    },
    {
      selector: 'LabeledStatement',
      message:
        'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
    },
    {
      selector: 'WithStatement',
      message:
        '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
    },
  ],
  'no-console': ['error', { allow: ['warn', 'error'] }],
  'guard-for-in': 'off',
  'no-param-reassign': ['error', { props: false }],

  'no-restricted-properties': [
    'error',
    {
      object: 'require',
      property: 'ensure',
      message:
        'Please use import() instead. More info: https://reactjs.org/docs/code-splitting.html#code-splitting',
    },
    {
      object: 'System',
      property: 'import',
      message:
        'Please use import() instead. More info: https://reactjs.org/docs/code-splitting.html#code-splitting',
    },
  ],
  'no-unused-vars': 'error',
  '@tablecheck/forbidden-imports': 'error',
  '@nx/enforce-module-boundaries': 'error',
};
