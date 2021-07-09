const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

/**
 * we need to manually inject react-devtools to support safari debugging
 */
module.exports = function applyReactDevTools(webpackConfig, { dev, target }) {
  if ((dev && process.env.BUNDLE_ANALYZER !== 'true') || target !== 'web') {
    return;
  }
  webpackConfig.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.BUNDLE_ANALYZER === 'true' ? 'server' : 'static',
      reportFilename: '../bundleAnalysisReport.html',
      openAnalyzer: dev
    })
  );
};
