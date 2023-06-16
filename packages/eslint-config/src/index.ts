import * as path from 'path';

import type { Linter } from 'eslint';
import * as fs from 'fs-extra';
import type { PackageJson } from 'type-fest';

import { configurableRuleOverrides } from './overrides/configurable';
import { cypressOverrides } from './overrides/cypress';
import { rootConfigsOverrides } from './overrides/rootConfigs';
import { scriptsOverrides } from './overrides/scripts';
import { testOverrides } from './overrides/tests';
import { typescriptOverrides } from './overrides/typescript';
import { typescriptDefinitionOverrides } from './overrides/typescriptDefinitions';
import { typescriptDocumentationOverrides } from './overrides/typescriptDocumentation';
import { typescriptTestsOverrides } from './overrides/typescriptTests';
import { emotionRules } from './rules/emotion';
import { generalRules } from './rules/general';
import { promiseRules } from './rules/promise';
import { reactRules } from './rules/react';

export type { Linter } from 'eslint';

if (!process.env.NODE_ENV) {
  // This check allows us to run linters inside IDE's
  process.env.NODE_ENV = 'development';
}

let reactVersion = '17'; // set to 17 for legacy reasons or to not error if react not present - should be able to detect below
const packageJsonPath = path.resolve(path.join(process.cwd(), 'package.json'));
if (fs.existsSync(packageJsonPath)) {
  const pkg = fs.readJsonSync(packageJsonPath) as PackageJson;
  if (pkg.dependencies && pkg.dependencies.react) {
    const versionOnly = pkg.dependencies.react
      .replace(/^[^0-9]+/gi, '')
      .replace(/\..+$/gi, '');
    if (versionOnly === '*')
      reactVersion = '18'; // dumb hack, but using '*' is more dumb
    else if (!Number.isNaN(parseFloat(versionOnly))) reactVersion = versionOnly;
  }
}

module.exports = {
  root: true,
  extends: [
    'airbnb',
    'plugin:eslint-comments/recommended',
    'prettier',
    'plugin:react-hooks/recommended',
  ],

  plugins: [
    'eslint-comments',
    '@emotion',
    'promise',
    'cypress',
    '@tablecheck',
    '@nx',
  ],

  globals: {
    CONFIG: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },

  env: {
    node: true,
    browser: true,
    commonjs: true,
    es6: true,
  },

  settings: {
    react: {
      version: reactVersion,
    },
  },

  overrides: [
    typescriptOverrides,
    typescriptTestsOverrides,
    testOverrides,
    cypressOverrides,
    typescriptDefinitionOverrides,
    typescriptDocumentationOverrides,
    scriptsOverrides,
    ...configurableRuleOverrides,
    rootConfigsOverrides,
  ].filter((o): o is Linter.ConfigOverride => !!o),

  rules: {
    ...generalRules,
    ...reactRules,
    ...promiseRules,
    ...emotionRules,
  },
} satisfies Linter.Config;
