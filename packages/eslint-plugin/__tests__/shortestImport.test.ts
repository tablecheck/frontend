import { join as pathJoin } from 'path';

import { RuleTester } from '@typescript-eslint/rule-tester';

import { shortestImport as rule, messageId } from '../src/shortestImport';

const typescriptSetups = [
  {
    name: 'basic',
    project: './tsconfig.test.json',
    tsconfigRootDir: pathJoin(__dirname, 'fixtures'),
  },
  {
    name: 'baseUrl Only',
    project: './tsconfig.base_only.json',
    tsconfigRootDir: pathJoin(__dirname, 'fixtures'),
  },
  {
    name: 'root',
    project: './test_src/tsconfig.test_root.json',
    tsconfigRootDir: pathJoin(__dirname, 'fixtures'),
  },
  {
    name: 'extends',
    project: './fixtures/tsconfig.test_extends.json',
    tsconfigRootDir: __dirname,
  },
] as const;

type TestResult<T extends { path: string; fixedPath?: undefined | string }> =
  (Omit<T, 'path' | 'fixedPath'> &
    ([undefined] extends [T['fixedPath']]
      ? { code: string }
      : { code: string; output: string }))[];

function buildCodeCase<
  T extends {
    name?: string;
    skipConfigs?: (typeof typescriptSetups)[number]['name'][];
  },
>({
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
  const name = `${rest.name || `\`${template(path)}\``} -  ${importType}`;
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

function mapConfig<
  T extends {
    filename: string;
    path: string;
    fixedPath?: string;
    skipConfigs?: unknown;
  },
>(configName: (typeof typescriptSetups)[number]['name']) {
  return (x: T) => {
    const {
      filename,
      path: configPath,
      fixedPath: configFixedPath,
      skipConfigs,
      ...rest
    } = x;
    const folderPrefixes = [] as string[];
    if (configName === 'extends') {
      folderPrefixes.push('fixtures');
    }
    let correctedPath = configPath;
    let correctedFixedPath = configFixedPath;
    if (configName === 'baseUrl Only') {
      if (configPath.startsWith('~/')) {
        correctedPath = configPath.substring(2);
      }
      if (configFixedPath?.startsWith('~/')) {
        correctedFixedPath = configFixedPath.substring(2);
      }
    }
    return {
      ...rest,
      path: correctedPath,
      fixedPath: correctedFixedPath,
      filename: pathJoin(...folderPrefixes, filename),
    };
  };
}

typescriptSetups.forEach((config) => {
  const ruleTester = new RuleTester({
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: config.project,
      tsconfigRootDir: config.tsconfigRootDir,
      sourceType: 'module',
    },
  });
  ruleTester.run(`shortestImport [${config.name}]`, rule, {
    valid: convertPathCaseToCodeCase(
      [
        {
          path: './second',
          filename: './test_src/feature1/slice1/index.ts',
        },
        {
          path: './second',
          filename: './test_src/feature1/index.ts',
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
        {
          path: '~/feature2/index',
          filename: './test_src/feature1/slice1/index.ts',
        },
        {
          path: '~/feature2/index',
          filename: './test_src/feature1/index.ts',
        },
        {
          path: '~/feature1/index',
          filename: './test_src/feature1/slice1/index.ts',
          options: [{ preferredAlias: ['~/feature1', 'feature1'] }],
        },
        {
          path: '~/feature1/slice1',
          filename: './test_src/feature1/index.ts',
          options: [{ preferredAlias: ['~/feature1', 'feature1'] }],
        },
        {
          path: '@node/module',
          filename: './test_src/feature1/slice1/inner1/index.ts',
        },
        {
          path: 'react',
          filename: './test_src/feature1/slice1/inner1/index.ts',
        },
        {
          path: '.',
          filename: './test_src/feature1/slice1/inner1/index.ts',
        },
      ].map(mapConfig(config.name)),
    ),
    invalid: convertPathCaseToCodeCase(
      [
        {
          name: 'prefer relative path over alias path 1',
          path: '~/feature1/slice1/second',
          fixedPath: './second',
          filename: './test_src/feature1/slice1/index.ts',
          errors: [{ messageId }],
        },
        {
          name: 'prefer relative path over alias path 2',
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
          name: 'prefer alias path over parent through baseUrl child',
          path: '../../feature1/index',
          fixedPath: '~/feature1/index',
          filename: './test_src/feature1/slice1/index.ts',
          errors: [{ messageId }],
        },
        {
          skipConfigs: ['baseUrl Only'],
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
        {
          name: 'prefer relative parent over short alias',
          path: '~/feature1/index',
          fixedPath: '../index',
          filename: './test_src/feature1/slice1/index.ts',
          errors: [{ messageId }],
        },
        {
          name: 'use alias over short/equal relative when option set',
          path: '../index',
          fixedPath: '~/feature1/index',
          filename: './test_src/feature1/slice1/index.ts',
          errors: [{ messageId }],
          options: [{ preferredAlias: ['~/feature1', 'feature1'] }],
        },
      ]
        .filter((c) => !c.skipConfigs || !c.skipConfigs.includes(config.name))
        .map(mapConfig(config.name)),
    ),
  });
});
