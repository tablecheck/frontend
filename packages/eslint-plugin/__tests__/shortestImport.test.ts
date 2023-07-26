import { RuleTester } from '@typescript-eslint/rule-tester';

import { shortestImport as rule, messageId } from '../src/shortestImport';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.test.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
});

type TestResult<T extends { path: string; fixedPath?: undefined | string }> =
  (Omit<T, 'path' | 'fixedPath'> &
    ([undefined] extends [T['fixedPath']]
      ? { code: string }
      : { code: string; output: string }))[];

function buildCodeCase<T extends { name?: string }>({
  path,
  fixedPath,
  importType,
  rest,
}: {
  path: string;
  fixedPath: string | undefined;
  importType: 'default' | 'dynamic';
  rest: T;
}) {
  const template =
    importType === 'default'
      ? (importPath: string) => `import { second } from '${importPath}';`
      : (importPath: string) => `const second = import('${importPath}');`;
  const name = `${rest.name || template(path)}: ${importType}`;
  if (fixedPath) {
    return {
      ...rest,
      code: template(path),
      output: template(fixedPath),
      name,
    };
  }
  return {
    ...rest,
    code: template(path),
    name,
  };
}

function convertPathCaseToCodeCase<
  T extends {
    name?: string;
    path: string;
    fixedPath?: undefined | string;
  } & Record<string, any>,
>(config: T[]): TestResult<T> {
  return config.reduce((r, { path, fixedPath, ...rest }) => {
    r.push(
      buildCodeCase({
        path,
        fixedPath,
        importType: 'default',
        rest,
      }) as never,
    );
    r.push(
      buildCodeCase({
        path,
        fixedPath,
        importType: 'dynamic',
        rest,
      }) as never,
    );
    return r;
  }, [] as TestResult<T>);
}

ruleTester.run('shortestImport', rule, {
  valid: convertPathCaseToCodeCase([
    {
      path: './second',
      filename: './test_src/feature1/slice1/index.ts',
    },
    {
      path: '../slice2',
      filename: './test_src/feature1/slice1/index.ts',
    },
    {
      path: '../inner2',
      filename: './test_src/feature1/slice1/inner1/index.ts',
    },
    {
      path: '~/feature1/slice2/second',
      filename: './test_src/feature1/slice1/inner1/index.ts',
    },
  ]),
  invalid: convertPathCaseToCodeCase([
    {
      name: 'prefer relative path over alias path',
      path: '~/feature1/slice1/second',
      fixedPath: './second',
      filename: './test_src/feature1/slice1/index.ts',
      errors: [{ messageId }],
    },
    {
      name: 'prefer relative path over alias path',
      path: '~/feature1/slice1/second',
      fixedPath: './slice1/second',
      filename: './test_src/feature1/index.ts',
      errors: [{ messageId }],
    },
    {
      name: 'prefer alias path over parent through baseUrl',
      path: '../../feature2',
      fixedPath: '~/feature2',
      filename: './test_src/feature1/slice1/index.ts',
      errors: [{ messageId }],
    },
    {
      name: 'prefer alias path over baseUrl resolve',
      path: 'feature2',
      fixedPath: '~/feature2',
      filename: './test_src/feature1/slice1/index.ts',
      errors: [{ messageId }],
    },
    {
      name: 'prefer relative parent path over alias/baseUrl',
      path: 'feature1/slice2',
      fixedPath: '../slice2',
      filename: './test_src/feature1/slice1/index.ts',
      errors: [{ messageId }],
    },
    {
      name: 'prefer alias over baseUrl and relative through root',
      path: '../../feature2/sliceA',
      fixedPath: '~/feature2/sliceA',
      filename: './test_src/feature1/slice1/index.ts',
      errors: [{ messageId }],
    },
    {
      name: 'prefer alias over deep relative parent (equal length)',
      path: '../../slice2/second',
      fixedPath: '~/feature1/slice2/second',
      filename: './test_src/feature1/slice1/inner1/index.ts',
      errors: [{ messageId }],
    },
  ]),
});
