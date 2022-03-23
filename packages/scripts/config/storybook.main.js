const nodeConfig = require('config');
const webpack = require('webpack');
const paths = require('./paths');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  // our babel-plugin doesn't play nice with storybook, the only extra thing we need though is this plugin
  babel: (options) => ({
    ...options,
    plugins: [...options.plugins, '@emotion/babel-plugin']
  }),
  webpackFinal: async (config) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        CONFIG: JSON.stringify(nodeConfig)
      })
    );

    return {
      ...config,
      resolve: {
        ...config.resolve,
        modules: (config.resolve.modules || []).concat([paths.appSrc]),
        alias: {
          ...config.resolve.alias,
          'emotion-theming': '@emotion/react',
          '@emotion/core': '@emotion/react',
          '@emotion/styled': '@emotion/styled',
          '@emotion/styled-base': '@emotion/styled-base'
        }
      }
    };
  }
};
