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
const { spawn, Pool, Worker } = require('threads');

const {
  configureLibTypescript,
  configureAppTypescript
} = require('./utils/configureTypescript');
const { processAllPackages } = require('./utils/package');
const icons = require('./utils/unicodeEmoji');
const verifyPackageTree = require('./utils/verifyPackageTree');
const { execa } = require('./utils/execa');
const { spinners } = require('./utils/taskLogFormatter');

if (process.env.SKIP_PREFLIGHT_CHECK !== 'true') {
  verifyPackageTree();
}

(async () => {
  spinners.add('config', {
    text: 'Configuring typescript and worker for build'
  });
  const [runnerConfigPath, pool] = await Promise.all([
    configureLibTypescript(true, true),
    Pool(() => spawn(new Worker('./rollup/buildPackage')))
  ]);
  spinners.succeed('config');

  let finalAwait;
  let success = true;
  try {
    const { references } = fs.readJsonSync(runnerConfigPath);
    if (references) {
      spinners.add('lerna', { text: 'Building lerna dependency graph' });
      const lernaGraphExec = await execa('lerna', [
        'list',
        '--graph',
        '--toposort',
        '--all'
      ]);
      const lernaGraph = JSON.parse(lernaGraphExec.stdout);
      const referencesWithPackageName = references.map((ref) => ({
        path: ref.path,
        packageName: fs.readJsonSync(
          path.join(path.dirname(ref.path), 'package.json')
        ).name
      }));
      const packageNames = referencesWithPackageName.map(
        ({ packageName }) => packageName
      );
      packageNames.forEach((packageName) => {
        lernaGraph[packageName] = lernaGraph[packageName].filter((name) =>
          packageNames.includes(name)
        );
      });
      spinners.succeed('lerna');
      const builtPackageNames = [];
      const buildingPackages = [];
      const recursiveBuild = async () => {
        const buildablePackages = packageNames.filter((packageName) => {
          if ([...builtPackageNames, ...buildingPackages].includes(packageName))
            return false;
          const remainingDeps = lernaGraph[packageName].filter(
            (depName) => !builtPackageNames.includes(depName)
          );
          return remainingDeps.length === 0;
        });
        await Promise.all(
          buildablePackages.map(async (packageName) => {
            buildingPackages.push(packageName);
            const packageReference = referencesWithPackageName.find(
              (ref) => ref.packageName === packageName
            );
            spinners.add(packageName, { text: `Building ${packageName}` });
            await pool.queue((buildPackage) =>
              buildPackage(packageReference.path, runnerConfigPath)
            );
            spinners.succeed(packageName);
            builtPackageNames.push(packageName);
            await recursiveBuild(packageName);
          })
        );
      };
      spinners.add('build', { text: 'Building packages...' });
      await recursiveBuild();
      spinners.succeed('build', { text: 'Packages build complete!' });
    } else {
      spinners.add('library', { text: `Building library` });
      await pool.queue((buildPackage) =>
        buildPackage(runnerConfigPath, runnerConfigPath)
      );
      spinners.succeed('library', { text: `Building library` });
    }
  } catch (e) {
    console.error(e);
    success = false;
  } finally {
    finalAwait = pool.terminate();
  }

  spinners.add('cleanup', {
    text: 'Re-configuring typescript for development'
  });
  if (systemSettings.isAppWithExports) {
    configureAppTypescript(false);
  } else {
    await configureLibTypescript(false, false, true);
  }
  spinners.succeed('cleanup');

  if (success) {
    spinners.add('check-package', {
      text: 'Checking package.json configuration'
    });
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
    spinners.succeed('check-package');
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
  await finalAwait;
  process.exit(success ? 0 : 1);
})();
