import {
  consistentImportPaths as rule,
  messageId
} from '../src/consistenImportPaths';
import { initRuleTester } from './utils';
import path from 'path';
import resolve from 'eslint-module-utils/resolve';

const ruleTester = initRuleTester({
  parser: path.resolve(
    './packages/eslint-plugin/node_modules/@typescript-eslint/parser'
  ),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
});

function buildFilename(relativePath) {
  return path.resolve(path.join(process.cwd(), relativePath))
}

const errors = [{messageId}];

const tests = [
  {
    filename: buildFilename('./src/components/a.js'),
    code: `import * as B from './b';`
  },
  {
    filename: buildFilename('./src/components/a.js'),
    code: `import * as C from 'components/a/components/c';`,
    output: `import * as C from './components/c';`
    errors

  },
  {
    code: `import { a } from '../../some_file';`,
    filename: buildFilename('./src/a/b.js'),
    output: `import { a } from 'some_file;`,
    errors
  }
];

‘./sibling' or ./folder/child should be preferred over absolutes - ie './...' should be used when it can be

EG in file components/a

import * as B from './b' is OK :check_mark: 

import * as C from 'components/a/components/c is NOT OK :cross_mark: 

‘components/something/nested' is preferred over '../components/something/nested' except that ../ should only be used in a case where we wouldn’t end up at the root level and are moving at most 2 parents up - ../../ is OK, but ../../../ is NOT OK.

EG in file components/a/components/b

 import * as C from '../c' is OK :check_mark: 

import * as C from 'components/a/components/c is NOT OK :cross_mark: 

import * as D from '../../../components/d' is NOT OK :cross_mark: 

import * as D from 'components/d is OK :check_mark: 

ruleTester.run('consistentImportPaths', rule, {
  valid: tests.map((test) => test.errors ? ({
    code: test.output,
    filename: test.filename
  }) : test),
  invalid: tests.filter(test => !!test.errors)
});
