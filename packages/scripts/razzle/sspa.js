const { produce } = require('immer');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const config = require('config');
const baseConfig = require('./spa');
const paths = require('../config/paths');
const { getArgv } = require('../scripts/utils/argv');

const appPackage = require(paths.appPackageJson);

const argv = getArgv({
  boolean: ['standalone'],
  alias: {
    standalone: 's'
  },
  default: {
    // If true will use `client.standalone.tsx` as the main entry point, otherwise uses `client.tsx`
    // though razzle actually ignores the file type in the name
    standalone: false
  }
});

module.exports = baseConfig.extend({
  modifyWebpackConfig({ webpackConfig }) {
    return produce((webpackConfigDraft) => {
      webpackConfigDraft.output = webpackConfigDraft.output || {};
      if (!argv.standalone) {
        webpackConfigDraft.output.library = appPackage.name;
        webpackConfigDraft.output.libraryTarget = 'window';
      }
      webpackConfigDraft.plugins.push(
        new WebpackManifestPlugin({
          seed: {
            // seed the manifest with the appVersion so that the parent app can report
            // the version of each child app
            appVersion: config.appVersion
          }
        })
      );
    })(webpackConfig);
  }
});
