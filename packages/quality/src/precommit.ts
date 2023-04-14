import path from 'path';

import { configureTypescript } from '@tablecheck/frontend-typescript';
import { getArgv, isLerna } from '@tablecheck/frontend-utils';
import fs from 'fs-extra';
import lintStaged from 'lint-staged';

import { validateLernaDeps } from './package.js';
import { validateEslintrc } from './validateEslintrc.js';
import { configCheck } from './configs.js';

const argv = getArgv();

export async function precommit() {
  if (!(await configCheck())) throw new Error('Config check failed');
  await validateEslintrc();

  const configPath = await configureTypescript({
    isBuild: false,
    shouldCleanLibs: false,
    shouldIgnorePackageArg: true
  });

  if (isLerna()) await validateLernaDeps();

  const lintStagedConfig: Record<string, string[] | string | (() => string)> = {
    '**/*.{ts,tsx,js,jsx}': [
      // eslint fix first, otherwise eslint fix may unprettify files
      // also inherently checks typescript, using quiet here as we only want what blocks
      // the user from committing
      'eslint --fix --quiet',
      'prettier --write'
    ],
    '**/!(*.ts|*.tsx|*.js|*.jsx|package-json.json)': 'prettier --write -u',
    '**/package.json': () =>
      `node ${require.resolve('./prettier-package-json')} --write`
  };

  if (fs.existsSync(path.join(process.cwd(), 'tsconfig.json'))) {
    lintStagedConfig['**/*.ts?(x)'] = () =>
      `tsc --noEmit --project ${configPath}`;
  }

  const success = await lintStaged({
    allowEmpty: false,
    concurrent: true,
    config: lintStagedConfig,
    cwd: process.cwd(),
    debug: false,
    maxArgLength: null,
    quiet: false,
    relative: false,
    shell: false,
    stash: true,
    verbose: argv.verbose
  });

  if (!success) {
    process.exit(1);
  }
}
