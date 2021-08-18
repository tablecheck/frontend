const path = require('path');

// eslint-disable-next-line import/no-unresolved
const { startDevServer } = require('@cypress/webpack-dev-server');

const setPorts = require('razzle-dev-utils/setPorts');
const createConfigAsync = require('razzle/config/createConfigAsync');
const loadRazzleConfig = require('razzle/config/loadRazzleConfig');
const webpack = require('webpack');

async function cypressComponentTesting(on, config) {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  if (config.testingType === 'component') {
    on('dev-server:start', async (options) => {
      const { razzle, razzleOptions, webpackObject, plugins, paths } =
        await loadRazzleConfig(webpack);
      if (!razzleOptions.verbose) {
        process.removeAllListeners('warning');
      }
      const isClientOnly = true;
      await setPorts(isClientOnly);
      const webpackConfig = await createConfigAsync(
        'web',
        'dev',
        razzle,
        webpackObject,
        isClientOnly,
        paths,
        plugins,
        {
          ...razzleOptions,
          enableReactRefresh: false
        }
      );
      webpackConfig.module.rules[0].include.push(
        path.join(paths.appSrc, '../cypress')
      );
      webpackConfig.output.libraryTarget = undefined;
      webpackConfig.output.library = undefined;
      webpackConfig.devServer = undefined;
      webpackConfig.entry.client.splice(1, 1);
      return startDevServer({
        options,
        webpackConfig
      });
    });
    config.env.reactDevtools = true;
  }
  return config;
}

module.exports = { cypressComponentTesting };
