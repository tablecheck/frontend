"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.shortestImport = exports.messageId = void 0;
var tslib_1 = require("tslib");
var path = require("path");
var ExpiringCache_1 = require("@typescript-eslint/typescript-estree/dist/parseSettings/ExpiringCache");
var getProjectConfigFiles_1 = require("@typescript-eslint/typescript-estree/dist/parseSettings/getProjectConfigFiles");
var utils_1 = require("@typescript-eslint/utils");
var fs_extra_1 = require("fs-extra");
exports.messageId = 'shortestImport';
exports.shortestImport = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce the consistent use of preferred import paths',
            recommended: false,
        },
        fixable: 'code',
        schema: [],
        messages: (_a = {},
            _a[exports.messageId] = "Prefer '{{ preferredPath }}' over '{{ importPath }}'",
            _a),
    },
    defaultOptions: [],
    create: function (context) {
        var resolvedFilePath = context.getPhysicalFilename
            ? context.getPhysicalFilename()
            : context.getFilename();
        var configs = (0, getProjectConfigFiles_1.getProjectConfigFiles)({
            filePath: resolvedFilePath,
            tsconfigRootDir: context.parserOptions.tsconfigRootDir,
            tsconfigMatchCache: new ExpiringCache_1.ExpiringCache(1),
        }, context.parserOptions.project || './tsconfig.json').map(function (configPath) {
            var filePath = path.join(context.parserOptions.tsconfigRootDir, configPath);
            return { filePath: filePath, config: fs_extra_1.default.readJSONSync(filePath) };
        });
        var pathMappings = configs.reduce(function (acc, _a) {
            var _b;
            var filePath = _a.filePath, config = _a.config;
            var baseUrl = (_b = config.compilerOptions) === null || _b === void 0 ? void 0 : _b.baseUrl;
            var baseUrlPaths = baseUrl
                ? fs_extra_1.default
                    .readdirSync(path.join(path.dirname(filePath), baseUrl), {
                    withFileTypes: true,
                })
                    .reduce(function (directoryMap, dirrent) {
                    var _a, _b;
                    if (dirrent.isDirectory())
                        return tslib_1.__assign(tslib_1.__assign({}, directoryMap), (_a = {}, _a[dirrent.name] = path.join(baseUrl, dirrent.name), _a));
                    return tslib_1.__assign(tslib_1.__assign({}, directoryMap), (_b = {}, _b[dirrent.name.replace(/\.[^.]+$/gi, '')] = path
                        .join(baseUrl, dirrent.name)
                        .replace(/^\.\//gi, ''), _b));
                }, {})
                : {};
            var compilerPaths = Object.entries(config.compilerOptions.paths || {}).reduce(function (compilerPathsMap, _a) {
                var _b;
                var key = _a[0], value = _a[1][0];
                return (tslib_1.__assign(tslib_1.__assign({}, compilerPathsMap), (_b = {}, _b[key.replace(/\/\*$/gi, '')] = value
                    .replace(/\/\*$/gi, '')
                    .replace(/^\.\//gi, ''), _b)));
            }, {});
            return tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, acc), compilerPaths), baseUrlPaths);
        }, {});
        function resolveImport(importPath) {
            var importParts = importPath.split('/');
            if (pathMappings[importParts[0]]) {
                return [pathMappings[importParts[0]]]
                    .concat(importParts.slice(1))
                    .join('/');
            }
            return importParts.join('/');
        }
        function getPathAliasImport(importPath) {
            var resolvedImportPath = importPath;
            if (importPath.startsWith('.')) {
                resolvedImportPath = path.resolve(path.dirname(resolvedFilePath), importPath);
            }
            var matchedMapping = Object.entries(pathMappings).find(function (_a) {
                var value = _a[1];
                return resolvedImportPath.includes(value);
            });
            if (!matchedMapping)
                return undefined;
            var key = matchedMapping[0], value = matchedMapping[1];
            return resolvedImportPath.replace(new RegExp("^.*?".concat(value.replace(/\//gi, '\\/'))), key);
        }
        function getRelativeImport(importPath, resolvedImportPath) {
            if (importPath.startsWith('.'))
                return importPath;
            var relativePath = path.relative(path.dirname(resolvedFilePath), resolvedImportPath);
            if (relativePath.startsWith('.'))
                return relativePath;
            return "./".concat(relativePath);
        }
        function relativeGoesThroughBaseUrl(relativePath) {
            var parentPath = relativePath
                .split('/')
                .filter(function (part) { return part === '..'; })
                .join('/');
            var absoluteImportPath = path.resolve(path.dirname(resolvedFilePath), relativePath);
            var resolvedPathRoot = path.resolve(path.dirname(resolvedFilePath), parentPath);
            return resolvedPathRoot === absoluteImportPath;
        }
        function shouldPreferRelative(relativePath, aliasPath) {
            if (!aliasPath)
                return true;
            if (relativeGoesThroughBaseUrl(relativePath))
                return false;
            var relativeLength = relativePath.split('/').length;
            var aliasLength = aliasPath.split('/').length;
            if (relativeLength === aliasLength && relativePath.startsWith('../'))
                return false;
            return relativeLength <= aliasLength;
        }
        function checkAndFixImport(node) {
            if (node.source.type !== utils_1.AST_NODE_TYPES.Literal)
                return;
            var importPath = node.source.value;
            if (typeof importPath !== 'string')
                return;
            var resolvedImport = resolveImport(importPath);
            var relativePath = getRelativeImport(importPath, resolvedImport);
            var aliasPath = getPathAliasImport(resolvedImport);
            var preferredPath = shouldPreferRelative(relativePath, aliasPath)
                ? relativePath
                : aliasPath;
            if (preferredPath === importPath)
                return;
            context.report({
                node: node,
                messageId: exports.messageId,
                data: {
                    preferredPath: preferredPath,
                    importPath: importPath,
                },
                fix: function (fixer) {
                    return fixer.replaceText(node.source, "'".concat(preferredPath, "'"));
                },
            });
        }
        return {
            ImportDeclaration: function (node) {
                checkAndFixImport(node);
            },
            ImportExpression: function (node) {
                checkAndFixImport(node);
            },
        };
    },
};
//# sourceMappingURL=shortestImport.js.map