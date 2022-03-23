const jsx = require('acorn-jsx');
const babel = require('@babel/core');

module.exports = {
  jsxPlugin: () => ({
    options(inputOptions) {
      const acornPlugins =
        inputOptions.acornInjectPlugins ||
        (inputOptions.acornInjectPlugins = []);
      acornPlugins.push(jsx());
    },
    transform(code) {
      return new Promise((resolve, reject) => {
        babel.transform(
          code,
          {
            plugins: ['@emotion/babel-plugin'],
            presets: [
              [
                '@babel/preset-react',
                { runtime: 'automatic', importSource: '@emotion/react' }
              ]
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });
    }
  })
};
