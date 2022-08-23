#!/usr/bin/env node
// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'lib';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  console.error(err);
  throw new Error();
});

import path from 'path';

import {
  userConfig,
  unicodeEmoji as icons,
  processAllPackages,
  logTaskStart,
  logTaskEnd
} from '@tablecheck/scripts-utils';
import chalk from 'chalk';
import fs from 'fs-extra';

import { buildPackage } from './buildPackage.js';
import { configureTypescript } from '@tablecheck/scripts-typescript';

logTaskStart('Configuring typescript for build');
const runnerConfigPath = await configureTypescript({
  isBuild: true,
  shouldCleanLibs: true
});
logTaskEnd(true);

let success = true;
try {
  const { references } = fs.readJsonSync(runnerConfigPath);
  if (references) {
    logTaskStart('Running Rollup');
    for (let i = 0; i < references.length; i += 1) {
      // needs to be async or subsequent projects don't build
      // eslint-disable-next-line no-await-in-loop
      await buildPackage(references[i].path, runnerConfigPath);
    }
    logTaskEnd(true);
  } else {
    await buildPackage(runnerConfigPath, runnerConfigPath);
  }
} catch (e) {
  logTaskEnd(false);
  // error is already output inside buildPackage function
  success = false;
}

logTaskStart('Re-configuring typescript for development');
configureTypescript({
  isBuild: false,
  shouldCleanLibs: userConfig.isAppWithExports,
  shouldIgnorePackageArg: !userConfig.isAppWithExports
});
logTaskEnd(true);

if (success) {
  logTaskStart('Checking package.json configuration');
  let hasMissingTypesDef = false;
  await processAllPackages((packageContent, packagePath) => {
    let { main, module, types } = packageContent;
    const folderPath = path.dirname(packagePath);
    if (!main || !fs.existsSync(path.resolve(folderPath, main))) {
      main = './lib/index.js';
    }
    if (!module || !fs.existsSync(path.resolve(folderPath, module))) {
      module = './lib/index.js';
    }
    if (!types || !fs.existsSync(path.resolve(folderPath, types))) {
      types = './lib/index.d.ts';
    }
    if (!fs.existsSync(path.resolve(folderPath, types)))
      hasMissingTypesDef = true;
    return {
      ...packageContent,
      main,
      module,
      types
    };
  });
  logTaskEnd(true);
  if (hasMissingTypesDef)
    console.log(
      chalk.cyan(
        `
  ${icons.info}  If you aren't exporting your types in index.ts please set the types option in package.json
     It should look something like this; \`"types": ["./lib/types.d.ts"]\`
     Documentation is here: https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html\n`
      )
    );
  console.log(chalk.green(`${icons.check} Successfully built!`));
} else {
  console.log(
    chalk.red(`${icons.error} Build Errored, please see above messages.`)
  );
}
process.exit(success ? 0 : 1);
