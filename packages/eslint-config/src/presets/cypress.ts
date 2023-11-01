import type { Linter } from 'eslint';

import { testOverrides as testRules } from '../overrides/tests';
import { namingRules } from '../rules/namingConvention';

if (!process.env.NODE_ENV) {
  // This check allows us to run linters inside IDE's
  process.env.NODE_ENV = 'development';
}

const testOverrides = Object.keys(testRules.rules ?? {}).reduce(
  (result, ruleKey) => ({ ...result, [ruleKey]: 'off' }),
  {},
);

module.exports = {
  env: {
    'cypress/globals': true,
  },
  rules: {
    ...testOverrides,
    'promise/catch-or-return': 'off',
    'promise/always-return': 'off',
    'import/no-import-module-exports': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/naming-convention': (
      ['error'] as Linter.RuleLevelAndOptions
    ).concat(
      (
        namingRules[
          '@typescript-eslint/naming-convention'
        ] as Linter.RuleLevelAndOptions
      ).slice(1),
      [
        {
          selector: 'memberLike',
          format: null,
        },
      ],
    ) as Linter.RuleLevelAndOptions,
  },
} satisfies Linter.Config;
