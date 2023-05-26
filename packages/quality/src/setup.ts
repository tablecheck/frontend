import path from 'path';

import chalk from 'chalk';
import fs from 'fs-extra';
import { execa, paths } from '@tablecheck/frontend-utils';

function safeCopyFile(sourceFileName: string, targetFilePath: string) {
  if (!fs.existsSync(targetFilePath)) {
    console.log(`Creating ${path.relative(paths.cwd, targetFilePath)}`);
    fs.copyFileSync(
      require.resolve(`../templates/${sourceFileName}`),
      targetFilePath,
    );
  }
}

export async function setup() {
  console.log(
    chalk.bold.blue('Setting up @tablecheck/scripts-quality default files...'),
  );
  const installPackages = ['prettier', 'husky', 'commitlint'];
  let commitLintFile;
  installPackages.push('@tablecheck/commitlint-config');
  commitLintFile = 'commitlint.config.js';
  await execa('npm', ['install'].concat(installPackages));
  await execa('npx', ['husky', 'install']);

  safeCopyFile('.eslintrc.js', path.join(paths.cwd, '.eslintrc.js'));
  safeCopyFile('.eslintignore', path.join(paths.cwd, '.eslintignore'));
  safeCopyFile('.prettierrc.json', path.join(paths.cwd, '.prettierrc.json'));
  safeCopyFile('.prettierignore', path.join(paths.cwd, '.prettierignore'));
  safeCopyFile(commitLintFile, path.join(paths.cwd, 'commitlint.config.js'));
  safeCopyFile('commit-msg', path.join(paths.cwd, '.husky/commit-msg'));
  safeCopyFile('pre-commit', path.join(paths.cwd, '.husky/pre-commit'));
}
