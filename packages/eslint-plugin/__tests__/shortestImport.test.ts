import { ESLintUtils } from '@typescript-eslint/utils';

import { shortestImport as rule, messageId } from '../src/shortestImport';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.test.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
});

ruleTester.run('shortestImport', rule, {
  valid: [
    {
      code: `import { second } from './second';`,
      filename: './test_src/feature1/slice1/index.ts',
    },
    {
      code: `import { second } from '../slice2';`,
      filename: './test_src/feature1/slice1/index.ts',
    },
    {
      code: `import { second } from '../inner2';`,
      filename: './test_src/feature1/slice1/inner1/index.ts',
    },
    {
      code: `import { second } from '~/feature1/slice2/second';`,
      filename: './test_src/feature1/slice1/inner1/index.ts',
    },
  ],
  invalid: [
    {
      name: 'prefer relative path over alias path',
      code: `import { second } from '~/feature1/slice1/second';`,
      output: `import { second } from './second';`,
      filename: './test_src/feature1/slice1/index.ts',
      errors: [{ messageId }],
    },
    {
      name: 'prefer relative path over alias path',
      code: `import { second } from '~/feature1/slice1/second';`,
      output: `import { second } from './slice1/second';`,
      filename: './test_src/feature1/index.ts',
      errors: [{ messageId }],
    },
    {
      name: 'prefer alias path over parent through baseUrl',
      code: `import { a } from '../../feature2';`,
      output: `import { a } from '~/feature2';`,
      filename: './test_src/feature1/slice1/index.ts',
      errors: [{ messageId }],
    },
    {
      name: 'prefer alias path over baseUrl resolve',
      code: `import { a } from 'feature2';`,
      output: `import { a } from '~/feature2';`,
      filename: './test_src/feature1/slice1/index.ts',
      errors: [{ messageId }],
    },
    {
      name: 'prefer relative parent path over alias/baseUrl',
      code: `import { a } from 'feature1/slice2';`,
      output: `import { a } from '../slice2';`,
      filename: './test_src/feature1/slice1/index.ts',
      errors: [{ messageId }],
    },
    {
      name: 'prefer alias over baseUrl and relative through root',
      code: `import { a } from '../../feature2/sliceA';`,
      output: `import { a } from '~/feature2/sliceA';`,
      filename: './test_src/feature1/slice1/index.ts',
      errors: [{ messageId }],
    },
    {
      name: 'prefer alias over deep relative parent (equal length)',
      code: `import { a } from '../../slice2/second';`,
      output: `import { a } from '~/feature1/slice2/second';`,
      filename: './test_src/feature1/slice1/inner1/index.ts',
      errors: [{ messageId }],
    },
  ],
});
