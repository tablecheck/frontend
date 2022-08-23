"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typescriptOverrides = void 0;
var tslib_1 = require("tslib");
var emotion_1 = require("../rules/emotion");
var general_1 = require("../rules/general");
var namingConvention_1 = require("../rules/namingConvention");
var promise_1 = require("../rules/promise");
var react_1 = require("../rules/react");
var buildBaseTypescript_1 = require("./buildBaseTypescript");
exports.typescriptOverrides = (0, buildBaseTypescript_1.buildBaseTypescript)(['**/*.ts', '**/*.tsx'], tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, general_1.generalRules), react_1.reactRules), promise_1.promiseRules), emotion_1.emotionRules), namingConvention_1.namingRules));
//# sourceMappingURL=typescript.js.map