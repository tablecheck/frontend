const jsx = require('acorn-jsx');
const babel = require('@babel/core');
const { checkEmotionReactDeps } = require('../utils/package');

module.exports = {
  jsxPlugin: (packagePath) => ({
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
                checkEmotionReactDeps(packagePath)
                  ? { runtime: 'automatic', importSource: '@emotion/react' }
                  : { runtime: 'automatic' }
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
