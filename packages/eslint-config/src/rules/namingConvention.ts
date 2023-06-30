import type { Linter } from 'eslint';
import type {} from '@typescript-eslint/eslint-plugin';

export const namingRules: Linter.RulesRecord = {
  camelcase: 'off',
  '@typescript-eslint/naming-convention': [
    'error',
    {
      selector: 'default',
      format: ['PascalCase'],
      filter: {
        regex: '(?<![gs]et)Component($|[A-Z0-9])',
        match: true,
      },
    },
    {
      selector: 'default',
      format: ['camelCase'],
    },
    // ignore all required quoted variables
    {
      selector: [
        'classProperty',
        'objectLiteralProperty',
        'typeProperty',
        'classMethod',
        'objectLiteralMethod',
        'typeMethod',
        'accessor',
        'enumMember',
      ],
      format: null,
      modifiers: ['requiresQuotes'],
    },
    {
      selector: 'variable',
      modifiers: ['destructured'],
      format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
    },
    {
      selector: 'variable',
      types: ['boolean'],
      format: ['camelCase'],
      custom: {
        regex: (() => {
          const booleanValues = [
            'is',
            'was',
            'should',
            'has',
            'had',
            'can',
            'did',
            'will',
            'allow',
          ];
          return `^(${booleanValues.join('|')})|^[a-z]+(${booleanValues
            .map((name) => `${name[0].toUpperCase()}${name.substring(1)}`)
            .join('|')})`;
        })(),
        match: true,
      },
    },
    {
      selector: 'variable',
      types: ['function'],
      format: ['PascalCase', 'camelCase'],
    },
    {
      selector: ['classMethod', 'objectLiteralMethod'],
      format: ['PascalCase', 'camelCase'],
    },
    {
      selector: 'variable',
      modifiers: ['global'],
      format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
    },
    {
      selector: 'variable',
      format: ['camelCase', 'UPPER_CASE'],
    },
    {
      selector: 'enum',
      format: ['PascalCase'],
      custom: {
        regex:
          '((people|men|women|children)|(s|ss|sh|ch|x|z|o)es|[^aiu]s)(?<!series|lens|news)$',
        match: false,
      },
    },
    {
      // this catches just all upper case which apparently is PascalCase?
      // Anything more than 4 caps should be banned
      selector: ['typeLike', 'enumMember'],
      format: ['PascalCase'],
      custom: {
        regex: '^[A-Z0-9]{4,}$',
        match: false,
      },
    },
    {
      selector: ['property'],
      format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
      leadingUnderscore: 'allowDouble', // double for __html
    },
    {
      selector: ['typeProperty'],
      format: ['camelCase', 'snake_case'],
      leadingUnderscore: 'allow',
    },
    {
      selector: 'parameter',
      format: ['camelCase'],
      leadingUnderscore: 'allow',
    },
  ],
};