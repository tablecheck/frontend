"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.forbiddenImports = exports.messageId = void 0;
exports.messageId = 'incorrectImport';
function assertForbiddenImport(node) {
    if (node.type !== 'ImportDeclaration')
        throw new Error('Invalid node type');
    var importName = node.source.value;
    var isForbiddenImport = [
        /^lodash$/,
        /^@fortawesome\/(pro|free)-[a-z]+-svg-icons$/,
    ].find(function (matcher) { return importName.match(matcher); });
    if (!isForbiddenImport)
        throw new Error('Not a forbidden import');
}
function findNameInReferences(name, references) {
    return references.find(function (r) { return r.identifier.name === name; });
}
function getSafeName(name, references) {
    var offsetCount = 1;
    var safeName = name;
    var matchedReference = findNameInReferences(name, references);
    while (matchedReference) {
        safeName = "".concat(name).concat(offsetCount);
        matchedReference = findNameInReferences(safeName, references);
        offsetCount += 1;
    }
    return safeName;
}
function renameImport(importName, subImportName, packageName) {
    if (importName !== 'lodash') {
        if (subImportName === packageName)
            return "import { ".concat(subImportName, " } from '").concat(importName, "/").concat(packageName, "';");
        return "import { ".concat(packageName, " as ").concat(subImportName, " } from '").concat(importName, "/").concat(packageName, "';");
    }
    return "import ".concat(subImportName, " from '").concat(importName, "/").concat(packageName, "';");
}
exports.forbiddenImports = {
    meta: {
        schema: [],
        type: 'suggestion',
        docs: {
            description: 'Ensure that certain packages are using specific imports instead of using the default import',
            recommended: 'error',
        },
        fixable: 'code',
        messages: (_a = {},
            _a[exports.messageId] = 'The default import "{{ importName }}" should be using a specific import',
            _a),
    },
    defaultOptions: [],
    create: function (context) { return ({
        ImportDeclaration: function (node) {
            try {
                assertForbiddenImport(node);
            }
            catch (e) {
                return;
            }
            var importName = node.source.value || '';
            var scope = context.getScope();
            context.report({
                node: node,
                messageId: exports.messageId,
                data: {
                    importName: importName,
                },
                fix: function (fixer) {
                    var replacements = [];
                    var newImports = '';
                    node.specifiers.forEach(function (importSpecifier) {
                        var _a;
                        try {
                            assertForbiddenImport(importSpecifier.parent);
                        }
                        catch (e) {
                            return;
                        }
                        var localName = importSpecifier.local.name;
                        var importedName = localName;
                        if ((_a = importSpecifier.imported) === null || _a === void 0 ? void 0 : _a.name) {
                            importedName = importSpecifier.imported.name;
                        }
                        if (importSpecifier.type === 'ImportDefaultSpecifier') {
                            var replacementImports = [];
                            var _loop_1 = function (i) {
                                if (scope.references[i].identifier.name === localName) {
                                    var parent_1 = scope.references[i].identifier.parent;
                                    switch (parent_1 === null || parent_1 === void 0 ? void 0 : parent_1.type) {
                                        case 'MemberExpression': {
                                            var memberName_1 = parent_1.property.name;
                                            var existingReplacement = replacementImports.find(function (_a) {
                                                var replacementImportName = _a[1];
                                                return replacementImportName === memberName_1;
                                            });
                                            var newImportName = existingReplacement
                                                ? existingReplacement[0]
                                                : getSafeName(memberName_1, scope.references);
                                            replacements.push(fixer.replaceTextRange(parent_1.range, newImportName));
                                            if (!existingReplacement)
                                                replacementImports.push([newImportName, memberName_1]);
                                            break;
                                        }
                                        default:
                                    }
                                }
                            };
                            for (var i = 0; i < scope.references.length; i += 1) {
                                _loop_1(i);
                            }
                            replacementImports.forEach(function (_a) {
                                var subImportName = _a[0], packageName = _a[1];
                                newImports += renameImport(importName, subImportName, packageName);
                            });
                        }
                        else {
                            newImports += renameImport(importName, localName, importedName);
                        }
                    });
                    replacements.push(fixer.replaceTextRange(node.range, newImports));
                    return replacements;
                },
            });
        },
    }); },
};
//# sourceMappingURL=forbiddenImports.js.map