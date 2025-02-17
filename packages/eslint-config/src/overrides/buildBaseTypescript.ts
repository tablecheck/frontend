import type { Linter } from 'eslint';

// Inspired by https://github.com/facebook/create-react-app/tree/next/packages/eslint-config-react-app

if (!process.env.NODE_ENV) {
  // This check allows us to run linters inside IDE's
  process.env.NODE_ENV = 'development';
}

/**
 * typescript specific overrides for enabled eslint rules.
 * Make sure to keep the typescript + eslint rules paired and commented.
 */
export const baseTypescriptRules: Linter.RulesRecord = {
  // unused variables
  '@typescript-eslint/no-unused-vars': 'error',
  'no-void': 'off',
  'no-unused-vars': 'off',

  // switch...case statements
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  'default-case': 'off',

  // returning value from function
  // see https://stackoverflow.com/a/67652059/1413689
  'consistent-return': 'off',
  '@typescript-eslint/no-unsafe-return': 'error',

  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unsafe-enum-comparison': 'off',
  '@typescript-eslint/method-signature-style': 'error',
  '@typescript-eslint/prefer-nullish-coalescing': [
    'error',
    {
      ignoreConditionalTests: true,
      ignoreMixedLogicalExpressions: true,
      ignorePrimitives: {
        string: true,
        boolean: true,
      },
    },
  ],
  '@typescript-eslint/consistent-type-imports': [
    'error',
    {
      disallowTypeAnnotations: false,
      fixStyle: 'inline-type-imports',
    },
  ],
  '@tablecheck/prefer-shortest-import': 'error',
  '@typescript-eslint/explicit-member-accessibility': [
    'error',
    {
      accessibility: 'explicit',
      overrides: {
        constructors: 'no-public',
      },
    },
  ],
};

export function buildBaseTypescript<T extends Linter.RulesRecord>({
  files,
  rules,
  ...options
}: {
  files: Linter.ConfigOverride['files'];
  rules: T;
} & Omit<
  Linter.ConfigOverride,
  'parser' | 'extends' | 'plugins' | 'settings' | 'rules' | 'files'
>): Linter.ConfigOverride {
  return {
    ...options,
    parser: '@typescript-eslint/parser',
    extends: [
      'airbnb-typescript',
      'plugin:@typescript-eslint/recommended-type-checked',
      'plugin:@typescript-eslint/stylistic-type-checked',
      'plugin:eslint-comments/recommended',
      'prettier',
    ],

    plugins: [
      '@typescript-eslint',
      'eslint-comments',
      '@emotion',
      'promise',
      'cypress',
    ],
    files,
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {},
      },
    },
    rules: {
      ...baseTypescriptRules,
      ...rules,
    },
  };
}
