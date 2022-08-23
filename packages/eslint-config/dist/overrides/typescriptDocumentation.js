"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typescriptDocumentationOverrides = void 0;
var tslib_1 = require("tslib");
var merge_1 = require("../utils/merge");
var documentation_1 = require("./documentation");
var tests_1 = require("./tests");
var typescript_1 = require("./typescript");
exports.typescriptDocumentationOverrides = (0, merge_1.mergeDeep)(typescript_1.typescriptOverrides, tests_1.testOverrides, {
    files: [
        '**/__fixtures__/**/*',
        '**/*.fixture.{ts,tsx}',
        '**/*.{stories,story}.{ts,tsx}',
        '.storybook/**/*.{ts,tsx}',
    ],
    rules: tslib_1.__assign(tslib_1.__assign({}, documentation_1.documentationOverrides.rules), { '@typescript-eslint/no-explicit-any': 'off', '@typescript-eslint/naming-convention': 'off', '@typescript-eslint/ban-ts-comment': 'off', 
        // here we use the more lenient consistent-return to help prevent weird errors
        '@typescript-eslint/explicit-module-boundary-types': 'off', 'consistent-return': 'error' }),
    env: {
        node: true,
    },
});
//# sourceMappingURL=typescriptDocumentation.js.map