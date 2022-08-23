import babel from '@babel/core';
import jsx from 'acorn-jsx';
export function jsxPlugin(shouldUseEmotion) {
    return {
        name: '@tablecheck/scripts-library:jsx',
        options(inputOptions) {
            let acornPlugins = inputOptions.acornInjectPlugins || [];
            if (!Array.isArray(acornPlugins))
                acornPlugins = [acornPlugins];
            acornPlugins.push(() => jsx());
        },
        transform(code) {
            return new Promise((resolve, reject) => {
                babel.transform(code, {
                    plugins: ['@emotion/babel-plugin'],
                    presets: [
                        [
                            '@babel/preset-react',
                            {
                                runtime: 'automatic',
                                importSource: shouldUseEmotion ? '@emotion/react' : undefined,
                            },
                        ],
                    ],
                }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
            });
        },
    };
}
//# sourceMappingURL=jsxPlugin.js.map