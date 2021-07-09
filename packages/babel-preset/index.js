const babelRazzle = require('babel-preset-razzle');

module.exports = function tcReactSystemBabelPreset(api, options) {
  const razzleConfig = babelRazzle(api, {
    ...options,
    'preset-react': {
      runtime: 'automatic',
      importSource: '@emotion/react',
      // see https://github.com/jaredpalmer/razzle/issues/1504
      pragma: undefined
    },
    'preset-env': {
      targets: {
        chrome: '35',
        firefox: '38',
        edge: '12',
        ie: '11',
        ios: '8',
        safari: '8',
        android: '4.4'
      }
    }
  });

  razzleConfig.plugins.push('@emotion/babel-plugin');
  razzleConfig.plugins.push('@babel/plugin-transform-react-constant-elements');
  return razzleConfig;
};
