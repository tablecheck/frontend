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
const eslintTypescriptRules: Linter.RulesRecord = {
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
};

/**
 *
 * @param files - file globs
 * @param rules - here should be the basic rules
 * @param forcedRules - this is the place to override any ts rules
 * @returns eslint-config
 */
export function buildBaseTypescript(
  files: Linter.ConfigOverride['files'],
  rules: Linter.RulesRecord,
  forcedRules?: Linter.RulesRecord,
): Linter.ConfigOverride | undefined {
  return {
    parser: '@typescript-eslint/parser',
    extends: [
      'airbnb-typescript',
      'plugin:@typescript-eslint/recommended-type-checked',
      'plugin:@typescript-eslint/stylistic-type-checked',
      'plugin:eslint-comments/recommended',
      'prettier',
      'plugin:react-hooks/recommended',
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
      ...rules,
      ...eslintTypescriptRules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
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
      ...forcedRules,
    },
  };
}
