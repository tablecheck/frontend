"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var path = require("path");
var fs = require("fs-extra");
var configurable_1 = require("./overrides/configurable");
var cypress_1 = require("./overrides/cypress");
var rootConfigs_1 = require("./overrides/rootConfigs");
var scripts_1 = require("./overrides/scripts");
var tests_1 = require("./overrides/tests");
var typescript_1 = require("./overrides/typescript");
var typescriptDefinitions_1 = require("./overrides/typescriptDefinitions");
var typescriptDocumentation_1 = require("./overrides/typescriptDocumentation");
var typescriptTests_1 = require("./overrides/typescriptTests");
var emotion_1 = require("./rules/emotion");
var general_1 = require("./rules/general");
var promise_1 = require("./rules/promise");
var react_1 = require("./rules/react");
if (!process.env.NODE_ENV) {
    // This check allows us to run linters inside IDE's
    process.env.NODE_ENV = 'development';
}
var reactVersion = '17'; // set to 17 for legacy reasons or to not error if react not present - should be able to detect below
var packageJsonPath = path.resolve(path.join(process.cwd(), 'package.json'));
if (fs.existsSync(packageJsonPath)) {
    var pkg = fs.readJsonSync(packageJsonPath);
    if (pkg.dependencies && pkg.dependencies.react) {
        var versionOnly = pkg.dependencies.react
            .replace(/^[^0-9]+/gi, '')
            .replace(/\..+$/gi, '');
        if (versionOnly === '*')
            reactVersion = '18'; // dumb hack, but using '*' is more dumb
        else if (!Number.isNaN(parseFloat(versionOnly)))
            reactVersion = versionOnly;
    }
}
module.exports = {
    root: true,
    extends: [
        'airbnb',
        'plugin:eslint-comments/recommended',
        'prettier',
        'plugin:react-hooks/recommended',
    ],
    plugins: [
        'eslint-comments',
        '@emotion',
        'promise',
        'cypress',
        '@tablecheck',
        '@nx',
    ],
    globals: {
        CONFIG: true,
    },
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    env: {
        node: true,
        browser: true,
        commonjs: true,
        es6: true,
    },
    settings: {
        react: {
            version: reactVersion,
        },
    },
    overrides: tslib_1.__spreadArray(tslib_1.__spreadArray([
        typescript_1.typescriptOverrides,
        typescriptTests_1.typescriptTestsOverrides,
        tests_1.testOverrides,
        cypress_1.cypressOverrides,
        typescriptDefinitions_1.typescriptDefinitionOverrides,
        typescriptDocumentation_1.typescriptDocumentationOverrides,
        scripts_1.scriptsOverrides
    ], configurable_1.configurableRuleOverrides, true), [
        rootConfigs_1.rootConfigsOverrides,
    ], false).filter(function (o) { return !!o; }),
    rules: tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, general_1.generalRules), react_1.reactRules), promise_1.promiseRules), emotion_1.emotionRules),
};
//# sourceMappingURL=index.js.map