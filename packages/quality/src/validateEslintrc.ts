import path from 'path';

import chalk from 'chalk';
import fs from 'fs-extra';
import { paths } from '@tablecheck/scripts-utils';
import { ESLint } from 'eslint';

export function validateEslintrc() {
  const eslintRcFile = '.eslintrc.js';
  const eslintRcPath = path.join(paths.cwd, eslintRcFile);
  if (!fs.existsSync(eslintRcPath)) {
    console.log(`No ${eslintRcFile} file detected, creating default`);
    fs.copyFileSync(
      require.resolve(`../templates/${eslintRcFile}`),
      eslintRcPath
    );
  } else {
    let eslintConfig: ESLint.ConfigData = {};
    try {
      eslintConfig = require(eslintRcPath);
    } catch (e) {
      // handled by variable initialisation check
    }
    if (
      !eslintConfig ||
      !eslintConfig.extends ||
      (typeof eslintConfig.extends === 'string' &&
        eslintConfig.extends !== '@tablecheck/eslint-config') ||
      (Array.isArray(eslintConfig.extends) &&
        !eslintConfig.extends.find(
          (name) => name.indexOf('@tablecheck/eslint-config') !== -1
        ))
    ) {
      console.warn(
        chalk.yellow.bold(
          `\n\nWARNING: Your ${eslintRcFile} file does not extend @tablecheck/eslint-config, your code may not be consistent.\n`
        )
      );
    } else if (Object.keys(eslintConfig).length > 1) {
      console.warn(
        chalk.red.bold(
          `\n\nWARNING: Your ${eslintRcFile} file does more than extend @tablecheck/eslint-config, resetting the file.\n`
        )
      );
      fs.copyFileSync(
        require.resolve(`../templates/${eslintRcFile}`),
        eslintRcPath
      );
    }
  }
  return eslintRcFile;
}
