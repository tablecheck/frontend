import * as path from 'path';

import type { Linter } from 'eslint';
import * as fs from 'fs-extra';
import type { PackageJson } from 'type-fest';

import { reactRules } from '../rules/react';

if (!process.env.NODE_ENV) {
  // This check allows us to run linters inside IDE's
  process.env.NODE_ENV = 'development';
}

let reactVersion = '17'; // set to 17 for legacy reasons or to not error if react not present - should be able to detect below
const packageJsonPath = path.resolve(path.join(process.cwd(), 'package.json'));
if (fs.existsSync(packageJsonPath)) {
  const pkg = fs.readJsonSync(packageJsonPath) as PackageJson;
  if (pkg.dependencies?.react) {
    const versionOnly = pkg.dependencies.react
      .replace(/^[^0-9]+/gi, '')
      .replace(/\..+$/gi, '');
    if (versionOnly === '*')
      reactVersion = '18'; // dumb hack, but using '*' is more dumb
    else if (!Number.isNaN(parseFloat(versionOnly))) reactVersion = versionOnly;
  }
}

module.exports = {
  plugins: ['react-refresh'],
  extends: ['plugin:react-hooks/recommended'],

  settings: {
    react: {
      version: reactVersion,
    },
  },

  rules: {
    ...reactRules,
  },
} satisfies Linter.Config;
