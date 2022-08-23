"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typescriptDefinitionOverrides = void 0;
var tslib_1 = require("tslib");
var emotion_1 = require("../rules/emotion");
var general_1 = require("../rules/general");
var promise_1 = require("../rules/promise");
var react_1 = require("../rules/react");
var buildBaseTypescript_1 = require("./buildBaseTypescript");
exports.typescriptDefinitionOverrides = (0, buildBaseTypescript_1.buildBaseTypescript)(['**/*.d.ts'], tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, general_1.generalRules), react_1.reactRules), promise_1.promiseRules), emotion_1.emotionRules), {
    'import/no-default-export': 'off',
    'vars-on-top': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
});
//# sourceMappingURL=typescriptDefinitions.js.map