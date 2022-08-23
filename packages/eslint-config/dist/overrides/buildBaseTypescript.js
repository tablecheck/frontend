"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBaseTypescript = void 0;
var tslib_1 = require("tslib");
// Inspired by https://github.com/facebook/create-react-app/tree/next/packages/eslint-config-react-app
if (!process.env.NODE_ENV) {
    // This check allows us to run linters inside IDE's
    process.env.NODE_ENV = 'development';
}
/**
 * typescript specific overrides for enabled eslint rules.
 * Make sure to keep the typescript + eslint rules paired and commented.
 */
var eslintTypescriptRules = {
    // unused variables
    '@typescript-eslint/no-unused-vars': 'error',
    'no-void': 'off',
    'no-unused-vars': 'off',
    // switch...case statements
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    'default-case': 'off',
    // returning value from function
    // see https://stackoverflow.com/a/67652059/1413689
    'consistent-return': 'off',
    '@typescript-eslint/no-unsafe-return': 'error',
};
/**
 *
 * @param files - file globs
 * @param rules - here should be the basic rules
 * @param forcedRules - this is the place to override any ts rules
 * @returns eslint-config
 */
function buildBaseTypescript(files, rules, forcedRules) {
    return {
        parser: '@typescript-eslint/parser',
        extends: [
            'airbnb-typescript',
            'plugin:@typescript-eslint/eslint-plugin/eslint-recommended',
            'plugin:@typescript-eslint/eslint-plugin/recommended-requiring-type-checking',
            'plugin:eslint-comments/recommended',
            'prettier',
            'plugin:react-hooks/recommended',
        ],
        plugins: [
            '@typescript-eslint',
            'eslint-comments',
            '@emotion',
            'promise',
            'cypress',
        ],
        files: files,
        settings: {
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },
            'import/resolver': {
                typescript: {},
            },
        },
        rules: tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, rules), eslintTypescriptRules), { '@typescript-eslint/no-explicit-any': 'error' }), forcedRules),
    };
}
exports.buildBaseTypescript = buildBaseTypescript;
//# sourceMappingURL=buildBaseTypescript.js.map