const path = require('path');

const fs = require('fs-extra');
const lintStaged = require('lint-staged');
const minimist = require('minimist');

const { configCheck } = require('./utils/configs');
const {
  configureAppTypescript,
  configureLibTypescript
} = require('./utils/configureTypescript');
const validateEslintrc = require('./utils/validateEslintrc');

const argv = minimist(process.argv.slice(2), {
  boolean: ['verbose'],
  default: {
    verbose: false
  }
});

async function runPrecommit() {
  configCheck();
  validateEslintrc();

  let configPath;
  if (
    fs.existsSync(path.join(process.cwd(), 'lerna.json')) ||
    fs.existsSync(path.join(process.cwd(), 'lib'))
  ) {
    configPath = await configureLibTypescript(false, false, true);
  } else {
    configPath = configureAppTypescript(false);
  }

  const lintStagedConfig = {
    '**/*.{ts,tsx,js,jsx}': [
      // eslint fix first, otherwise eslint fix may unprettify files
      // also inherently checks typescript
      'eslint --fix --no-eslintrc --config ./.eslintrc.js',
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

(async () => {
  try {
    await runPrecommit();
    process.exit(0);
  } catch (e) {
    if (argv.verbose) console.error(e);
    process.exit(1);
  }
})();
