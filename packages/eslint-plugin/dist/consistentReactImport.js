"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.consistentReactImport = exports.messageId = void 0;
exports.messageId = 'consistentReactImport';
exports.consistentReactImport = {
    meta: {
        schema: [],
        type: 'suggestion',
        docs: {
            description: 'Ensure that react is always imported and used consistently',
            recommended: 'error',
        },
        fixable: 'code',
        messages: (_a = {},
            _a[exports.messageId] = "React should be imported with `import * as React from 'react';`",
            _a),
    },
    defaultOptions: [],
    create: function (context) {
        var importNodes = [];
        var jsxElements = [];
        var existingReactNamespace;
        return {
            JSXElement: function (node) {
                jsxElements.push(node);
            },
            ImportDeclaration: function (node) {
                var importName = node.source.value || '';
                if (importName !== 'react')
                    return;
                if (node.specifiers[0].type === 'ImportNamespaceSpecifier') {
                    existingReactNamespace = node.specifiers[0].local.name;
                    return;
                }
                importNodes.push(node);
            },
            'Program:exit': function () {
                var scope = context.getScope();
                var reactNamespace = existingReactNamespace || 'React';
                importNodes.forEach(function (node, index) {
                    context.report({
                        node: node,
                        messageId: exports.messageId,
                        fix: function (fixer) {
                            var replacements = [];
                            function recursivelyUpdateVariableUsage(updateScope, localName, importedName) {
                                var variables = updateScope.variables, childScopes = updateScope.childScopes;
                                if (updateScope.type !== 'global') {
                                    var variableDefinition = variables.find(function (_a) {
                                        var name = _a.name;
                                        return name === localName;
                                    });
                                    if (variableDefinition)
                                        variableDefinition.references.forEach(function (reference) {
                                            if (jsxElements.find(function (element) {
                                                return element.openingElement.name ===
                                                    reference.identifier;
                                            }))
                                                return;
                                            replacements.push(fixer.replaceTextRange(reference.identifier.range, "".concat(reactNamespace, ".").concat(importedName)));
                                        });
                                    // else is an unused import
                                }
                                for (var i = 0; i < childScopes.length; i += 1) {
                                    recursivelyUpdateVariableUsage(childScopes[i], localName, importedName);
                                }
                            }
                            node.specifiers.forEach(function (importSpecifier) {
                                var _a;
                                var localName = importSpecifier.local.name;
                                var importedName = localName;
                                if ((_a = importSpecifier.imported) === null || _a === void 0 ? void 0 : _a.name) {
                                    importedName = importSpecifier.imported
                                        .name;
                                }
                                if (importSpecifier.type !== 'ImportDefaultSpecifier') {
                                    recursivelyUpdateVariableUsage(scope, localName, importedName);
                                    jsxElements.forEach(function (jsxNode) {
                                        // @ts-expect-error
                                        if (jsxNode.openingElement.name.name === localName) {
                                            replacements.push(fixer.replaceText(jsxNode.openingElement.name, "".concat(reactNamespace, ".").concat(importedName)));
                                            replacements.push(fixer.replaceText(jsxNode.closingElement.name, "".concat(reactNamespace, ".").concat(importedName)));
                                        }
                                    });
                                }
                            });
                            var sourcecode = context.getSourceCode();
                            var lineStartWhitespace = sourcecode.lines[node.loc.start.line - 1].replace(/[^ \t].+/, '');
                            var rangeStart = lineStartWhitespace.length === node.loc.start.column
                                ? node.range[0] - lineStartWhitespace.length - 1
                                : node.range[0];
                            replacements.push(existingReactNamespace || index > 0
                                ? fixer.replaceTextRange([rangeStart, node.range[1]], '')
                                : fixer.replaceTextRange(node.range, "import * as ".concat(reactNamespace, " from 'react';")));
                            return replacements;
                        },
                    });
                });
            },
        };
    },
};
//# sourceMappingURL=consistentReactImport.js.map