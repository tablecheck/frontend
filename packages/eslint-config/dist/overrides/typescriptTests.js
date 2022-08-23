"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typescriptTestsOverrides = void 0;
var merge_1 = require("../utils/merge");
var tests_1 = require("./tests");
var typescript_1 = require("./typescript");
exports.typescriptTestsOverrides = typescript_1.typescriptOverrides
    ? (0, merge_1.mergeDeep)(typescript_1.typescriptOverrides, tests_1.testOverrides, {
        files: [
            '**/__mocks__/**/*.{ts,tsx}',
            '**/__setup__/**/*.{ts,tsx}',
            '**/__tests__/**/*.{ts,tsx}',
            '**/__tests__/*.{ts,tsx}',
            '**/*.test.{ts,tsx}',
            '**/*.spec.{ts,tsx}',
        ],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/naming-convention': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            // here we use the more lenient consistent-return to help prevent weird errors
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            'consistent-return': 'error',
        },
        env: {
            node: true,
        },
    })
    : undefined;
//# sourceMappingURL=typescriptTests.js.map