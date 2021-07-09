const path = require('path');

const config = require('config');
// razzle dependency so not handled here
// eslint-disable-next-line import/no-extraneous-dependencies
const CopyPlugin = require('copy-webpack-plugin');
const fs = require('fs-extra');
const { produce } = require('immer');
const { getArgv } = require('../scripts/utils/argv');
const baseConfig = require('./base');

const argv = getArgv({
  boolean: ['standalone', 'staticJsEntry'],
  alias: {
    standalone: 's'
  },
  default: {
    // If true will use `client.standalone.tsx` as the main entry point, otherwise uses `client.tsx`
    // though razzle actually ignores the file type in the name
    standalone: false,
    staticJsEntry: false
  }
});

const modifyWebpackOptions = ({ options: { webpackOptions } }) =>
  produce((draft) => {
    draft.htmlWebpackPluginOptions = produce((pluginDraft) => {
      pluginDraft.inject = true;
      pluginDraft.templateParameters = {
        title: config.htmlTitle || 'TableCheck'
      };
    })(draft.htmlWebpackPluginOptions || {});
  })(webpackOptions);

const modifyPaths = ({ paths }) =>
  produce((draft) => {
    const { appPublic, appHtml, appClientIndexJs } = draft;
    if (!fs.existsSync(appPublic)) {
      draft.appPublic = path.resolve('../templates/public');
    }
    if (!fs.existsSync(appHtml)) {
      draft.appHtml = require.resolve('../templates/index.html');
    }
    if (argv.standalone) {
      draft.appClientIndexJs = `${appClientIndexJs}.standalone`;
    }
  })(paths);

const modifyWebpackConfig = ({ webpackConfig, options, paths }) =>
  produce((webpackConfigDraft) => {
    if (
      argv.staticJsEntry ||
      (options && options.razzleOptions && options.razzleOptions.staticJsEntry)
    ) {
      webpackConfigDraft.output.filename = 'static/js/[name].js';
    }
    if (!fs.existsSync(paths.appPublic)) {
      webpackConfigDraft.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(__dirname, '../templates/public/**/*'),
              to: paths.appBuild,
              context: path.join(__dirname, '../templates'),
              globOptions: {
                ignore: [`${paths.appPublic.replace(/\\/g, '/')}/index.html`]
              }
            }
          ]
        })
      );
    }
  })(webpackConfig);

module.exports = baseConfig.extend({
  options: {
    buildType: 'spa'
  },
  modifyPaths,
  modifyWebpackConfig,
  modifyWebpackOptions
});
