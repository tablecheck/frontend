import { RuleTester } from '@typescript-eslint/rule-tester';
import { TSESLint } from '@typescript-eslint/utils';

import { forbiddenImports as rule, messageId } from '../src/forbiddenImports';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.test.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
});

const filename = './test_src/default.tsx';

ruleTester.run('forbiddenImports > valid other import formats', rule, {
  valid: [
    { code: `import 'moment/locales/en';`, filename },
    { code: `import something from 'moment';`, filename },
    { code: `import { something } from 'moment';`, filename },
  ],
  invalid: [
    {
      code: `import { merge } from 'lodash';`,
      output: `import merge from 'lodash/merge';`,
      filename,
      errors: [
        {
          messageId: 'incorrectImport',
          data: {
            importName: 'lodash',
          },
        },
      ],
    },
  ],
});

ruleTester.run('forbiddenImports > lodash', rule, {
  valid: [{ code: `import merge from 'lodash/merge';`, filename }],
  invalid: [
    {
      code: `import { merge as _merge } from 'lodash';`,
      output: `import _merge from 'lodash/merge';`,
      filename,
      errors: [
        {
          messageId: 'incorrectImport',
          data: {
            importName: 'lodash',
          },
        },
      ],
    },
    {
      code: `import lodash from 'lodash';lodash.merge();lodash.slice();`,
      output: `import merge from 'lodash/merge';import slice from 'lodash/slice';merge();slice();`,
      filename,
      errors: [
        {
          messageId: 'incorrectImport',
          data: {
            importName: 'lodash',
          },
        },
      ],
    },
    {
      code: `import lodash from 'lodash';lodash.merge();const merge = 'test';`,
      output: `import merge1 from 'lodash/merge';merge1();const merge = 'test';`,
      filename,
      errors: [
        {
          messageId: 'incorrectImport',
          data: {
            importName: 'lodash',
          },
        },
      ],
    },
  ],
});

const testFaPackages = [
  '@fortawesome/pro-regular-svg-icons',
  '@fortawesome/pro-solid-svg-icons',
  '@fortawesome/free-regular-svg-icons',
  '@fortawesome/free-brands-svg-icons',
];

ruleTester.run('forbiddenImports > @fortawesome', rule, {
  valid: testFaPackages.reduce(
    (result, packageName) =>
      result.concat([
        { code: `import { faIcon } from '${packageName}/faIcon';`, filename },
      ]),
    [] as { code: string; filename: string }[],
  ),
  invalid: testFaPackages.reduce(
    (result, packageName) =>
      result.concat([
        {
          code: `import { faIcon } from '${packageName}';`,
          output: `import { faIcon } from '${packageName}/faIcon';`,
          filename,
          errors: [
            {
              messageId: 'incorrectImport',
              data: {
                importName: packageName,
              },
            },
          ],
        },
        {
          code: `import { faIcon1, faIcon2, faIcon3 } from '${packageName}';`,
          output: `import { faIcon1 } from '${packageName}/faIcon1';import { faIcon2 } from '${packageName}/faIcon2';import { faIcon3 } from '${packageName}/faIcon3';`,
          filename,
          errors: [
            {
              messageId: 'incorrectImport',
              data: {
                importName: packageName,
              },
            },
          ],
        },
      ]),
    [] as TSESLint.RunTests<typeof messageId, never>['invalid'],
  ),
});
