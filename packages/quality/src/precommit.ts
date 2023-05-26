import { getArgv } from '@tablecheck/frontend-utils';
import lintStaged from 'lint-staged';

import { validateEslintrc } from './validateEslintrc.js';
import { configCheck } from './configs.js';

const argv = getArgv();

export async function precommit() {
  if (!(await configCheck())) throw new Error('Config check failed');
  await validateEslintrc();

  const lintStagedConfig: Record<string, string[] | string | (() => string)> = {
    '**/*.{ts,tsx,js,jsx}': [
      // eslint fix first, otherwise eslint fix may unprettify files
      // the user from committing
      'eslint --fix --quiet',
      'prettier --write',
    ],
    '**/!(*.ts|*.tsx|*.js|*.jsx|package-json.json)': 'prettier --write -u',
    '**/package.json': () =>
      `node ${require.resolve('./prettier-package-json')} --write`,
  };

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
    verbose: argv.verbose,
  });

  if (!success) {
    process.exit(1);
  }
}
