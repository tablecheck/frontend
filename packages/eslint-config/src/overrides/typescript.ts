import { emotionRules } from '../rules/emotion';
import { generalRules } from '../rules/general';
import { namingRules } from '../rules/namingConvention';
import { promiseRules } from '../rules/promise';
import { reactRules } from '../rules/react';

import { buildBaseTypescript } from './buildBaseTypescript';

export const typescriptOverrides = buildBaseTypescript(
  ['**/*.ts', '**/*.tsx'],
  {
    ...generalRules,
    ...reactRules,
    ...promiseRules,
    ...emotionRules,
    ...namingRules,
  },
);
