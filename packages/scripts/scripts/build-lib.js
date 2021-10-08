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

const path = require('path');

const systemSettings = require('@tablecheck/scripts-utils/userConfig');
const chalk = require('chalk');
const fs = require('fs-extra');

const { buildPackage } = require('./rollup/buildPackage');
const {
  configureLibTypescript,
  configureAppTypescript
} = require('./utils/configureTypescript');
const { processAllPackages } = require('./utils/package');
const icons = require('./utils/unicodeEmoji');
const verifyPackageTree = require('./utils/verifyPackageTree');
const { logTaskEnd, logTaskStart } = require('./utils/taskLogFormatter');

if (process.env.SKIP_PREFLIGHT_CHECK !== 'true') {
  verifyPackageTree();
}

(async () => {
  logTaskStart('Configuring typescript for build');
  const runnerConfigPath = await configureLibTypescript(true, true);
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
  if (systemSettings.isAppWithExports) {
    configureAppTypescript(false);
  } else {
    await configureLibTypescript(false, false, true);
  }
  logTaskEnd(true);

  if (success) {
    logTaskStart('Checking package.json configuration');
    await processAllPackages((packageContent, packagePath) => {
      let { main, module, types } = packageContent;
      const folderPath = path.dirname(packagePath);
      if (!main || !fs.existsSync(path.resolve(folderPath, main))) {
        main = './lib/es5/index.js';
      }
      if (!module || !fs.existsSync(path.resolve(folderPath, module))) {
        module = './lib/esm/index.js';
      }
      if (!types || !fs.existsSync(path.resolve(folderPath, types))) {
        types = './lib/esm/index.d.ts';
      }
      return {
        ...packageContent,
        main,
        module,
        types
      };
    });
    logTaskEnd(true);
    console.log(
      chalk.cyan(
        `
  ${icons.info}  If you aren't exporting your types in index.ts please set the types option in package.json
     It should look something like this; \`"types": ["./lib/esm/types.d.ts"]\`
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
})();
