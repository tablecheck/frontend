const path = require('path');

const systemSettings = require('@tablecheck/scripts-utils/userConfig');
const config = require('config');
const webpack = require('webpack');
const { produce } = require('immer');
const fs = require('fs-extra');

const { extendConfig } = require('./extendConfig');
const setupFunctions = require('./setup');

const userPackage = require(path.resolve(process.cwd(), './package.json'));

let externalModules = ['uglify-js'];
if (systemSettings.babelExternals && systemSettings.babelExternals.length) {
  externalModules = externalModules.concat(systemSettings.babelExternals);
}

// this forces the transpilation into the bundle of certain files so that `CONFIG` get's rewritten correctly
const externals = fs
  .readdirSync(path.join(process.cwd(), 'node_modules'))
  .filter((nodeModule) =>
    externalModules.some((externalModule) =>
      nodeModule.includes(externalModule)
    )
  )
  .reduce((modules, mod) => ({ ...modules, [mod]: `commonjs ${mod}` }), {});

const razzleSetupDirectory = path.resolve(process.cwd(), 'razzle');
if (fs.existsSync(razzleSetupDirectory)) {
  const setupFiles = fs.readdirSync(razzleSetupDirectory);
  setupFiles.forEach((fileName) => {
    const filepath = path.join(razzleSetupDirectory, fileName);
    const relativePath = path.relative(process.cwd(), filepath);
    try {
      setupFunctions.push([relativePath, require(filepath)]);
    } catch (e) {
      console.log(`Error loading setup file @ "${relativePath}"`);
      console.log(
        'Please ensure it exports a single modifyWebpackConfig function via `module.exports = function...`'
      );
      console.log(e);
    }
  });
}

if (userPackage.port) {
  console.log(
    `WARNING: Setting port in package.json is unsupported, please use env var PORT instead.`
  );
  console.log(
    `         This can be done either in the script definitions of package.json or in a .env file.`
  );
}

module.exports = extendConfig(
  {},
  {
    options: {
      enableReactRefresh: true
    },
    modifyWebpackConfig({ webpackConfig, env: { target, dev } }) {
      return produce((webpackConfigDraft) => {
        if (target === 'web') {
          const originalClientEntry = webpackConfigDraft.entry.client;
          let client;
          if (Array.isArray(originalClientEntry)) {
            client = [require.resolve('../config/polyfills')].concat(
              originalClientEntry
            );
          } else {
            client = [
              require.resolve('../config/polyfills'),
              originalClientEntry
            ];
          }
          webpackConfigDraft.entry.client = client;
        }

        setupFunctions.forEach(([name, func]) => {
          try {
            func(webpackConfigDraft, { dev, target });
          } catch (e) {
            console.log(`Error running setupFunction: "${name}"`);
            console.error(e);
          }
        });

        webpackConfigDraft.plugins.push(
          new webpack.DefinePlugin({
            CONFIG: JSON.stringify(config)
          })
        );
        if (userPackage.dependencies && userPackage.dependencies.moment) {
          // this needs to be conditionally required as just requiring it errors if
          // moment is not a dependency of the project
          const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
          webpackConfigDraft.plugins.push(new MomentLocalesPlugin());
        }
        webpackConfigDraft.externals = externals;

        webpackConfigDraft.resolve.mainFields =
          target === 'web' ? ['module', 'browser', 'main'] : ['main', 'module'];
      })(webpackConfig);
    }
  }
);
