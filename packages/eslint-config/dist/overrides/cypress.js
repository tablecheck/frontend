"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cypressOverrides = void 0;
var tslib_1 = require("tslib");
var namingConvention_1 = require("../rules/namingConvention");
var merge_1 = require("../utils/merge");
var tests_1 = require("./tests");
var typescript_1 = require("./typescript");
var testOverrides = Object.keys(tests_1.testOverrides.rules).reduce(function (result, ruleKey) {
    var _a;
    return (tslib_1.__assign(tslib_1.__assign({}, result), (_a = {}, _a[ruleKey] = 'off', _a)));
}, {});
exports.cypressOverrides = typescript_1.typescriptOverrides
    ? (0, merge_1.mergeDeep)(typescript_1.typescriptOverrides, {
        files: ['**/cypress/**/*', '**/*.cypress.ts', '**/*.cypress.tsx'],
        parserOptions: {
            ecmaVersion: 9,
            sourceType: 'module',
            // defining both of these to prevent a bug in precommit staged linter from failing in some cases
            project: ['./cypress/tsconfig.json', './tsconfig.json'],
        },
        env: {
            'cypress/globals': true,
        },
        rules: tslib_1.__assign(tslib_1.__assign({}, testOverrides), { 'promise/catch-or-return': 'off', 'promise/always-return': 'off', 'import/no-import-module-exports': 'off', '@typescript-eslint/no-explicit-any': 'off', '@typescript-eslint/no-namespace': 'off', '@typescript-eslint/naming-convention': ['error'].concat(namingConvention_1.namingRules['@typescript-eslint/naming-convention'].slice(1), [
                {
                    selector: 'memberLike',
                    format: null,
                },
            ]) }),
    })
    : undefined;
//# sourceMappingURL=cypress.js.map