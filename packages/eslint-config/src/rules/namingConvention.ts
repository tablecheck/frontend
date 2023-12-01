import type { Linter } from 'eslint';

const componentRegexpMatch = {
  regex: '(?<![gs]et)Component$',
  match: true,
};

export const namingRules: Linter.RulesRecord = {
  camelcase: 'off',
  '@typescript-eslint/naming-convention': [
    'error',
    {
      selector: 'default',
      format: ['camelCase', 'PascalCase'],
      filter: componentRegexpMatch,
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
            'does',
            'will',
            'allow',
          ];
          return `^(disabled$|${booleanValues.join(
            '|',
          )})|^[a-z]+(${booleanValues
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
      selector: 'import',
      format: ['PascalCase', 'camelCase', 'UPPER_CASE'],
    },
    {
      selector: ['function', 'classMethod', 'objectLiteralMethod'],
      format: ['PascalCase', 'camelCase'],
    },
    {
      selector: 'variable',
      modifiers: ['global'],
      format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
    },
    {
      selector: 'variable',
      format: ['PascalCase'],
      filter: componentRegexpMatch,
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
      selector: ['property', 'parameterProperty'],
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
      format: ['camelCase', 'PascalCase'],
      leadingUnderscore: 'allow',
    },
  ],
};
