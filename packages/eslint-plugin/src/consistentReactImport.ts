import type { ImportSpecifier } from '@typescript-eslint/types/dist/generated/ast-spec';
import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { type RuleFix } from '@typescript-eslint/utils/dist/ts-eslint';

export const messageId = 'consistentReactImport';

export const consistentReactImport: TSESLint.RuleModule<typeof messageId> = {
  meta: {
    schema: [],
    type: 'suggestion',
    docs: {
      description: 'Ensure that react is always imported and used consistently',
      recommended: 'recommended',
      url: 'https://github.com/tablecheck/frontend/tree/main/packages/eslint-plugin/docs/rules/consistent-react-import.md',
    },
    fixable: 'code',
    messages: {
      [messageId]:
        "React should be imported with `import * as React from 'react';`",
    },
  },
  defaultOptions: [],
  create: (context) => {
    const importNodes: TSESTree.ImportDeclaration[] = [];
    const jsxElements: TSESTree.JSXElement[] = [];
    let existingReactNamespace: string;
    return {
      JSXElement(node) {
        jsxElements.push(node);
      },
      ImportDeclaration(node) {
        const importName = node.source.value || '';
        if (importName !== 'react') return;
        if (
          node.specifiers[0].type ===
          TSESTree.AST_NODE_TYPES.ImportNamespaceSpecifier
        ) {
          existingReactNamespace = node.specifiers[0].local.name;
          return;
        }
        importNodes.push(node);
      },
      'Program:exit': function programExit() {
        const scope = context.getScope();
        const reactNamespace = existingReactNamespace || 'React';
        importNodes.forEach((node, index) => {
          context.report({
            node,
            messageId,
            fix(fixer) {
              const replacements: RuleFix[] = [];

              function recursivelyUpdateVariableUsage(
                updateScope: typeof scope,
                localName: string,
                importedName: string,
              ) {
                const { variables, childScopes } = updateScope;
                if (updateScope.type !== TSESLint.Scope.ScopeType.global) {
                  const variableDefinition = variables.find(
                    ({ name }) => name === localName,
                  );
                  if (variableDefinition)
                    variableDefinition.references.forEach((reference) => {
                      if (
                        jsxElements.find(
                          (element) =>
                            element.openingElement.name ===
                            reference.identifier,
                        )
                      )
                        return;
                      replacements.push(
                        fixer.replaceTextRange(
                          reference.identifier.range,
                          `${reactNamespace}.${importedName}`,
                        ),
                      );
                    });
                  // else is an unused import
                }
                for (const child of childScopes) {
                  recursivelyUpdateVariableUsage(
                    child,
                    localName,
                    importedName,
                  );
                }
              }

              node.specifiers.forEach((importSpecifier) => {
                const localName = importSpecifier.local.name;
                let importedName = localName;
                if ((importSpecifier as ImportSpecifier).imported?.name) {
                  importedName = (importSpecifier as ImportSpecifier).imported
                    .name;
                }
                if (
                  importSpecifier.type !==
                  TSESTree.AST_NODE_TYPES.ImportDefaultSpecifier
                ) {
                  recursivelyUpdateVariableUsage(
                    scope,
                    localName,
                    importedName,
                  );
                  jsxElements.forEach((jsxNode) => {
                    if (
                      jsxNode.openingElement.name.type ===
                        TSESTree.AST_NODE_TYPES.JSXIdentifier &&
                      jsxNode.openingElement.name.name === localName
                    ) {
                      replacements.push(
                        fixer.replaceText(
                          jsxNode.openingElement.name,
                          `${reactNamespace}.${importedName}`,
                        ),
                      );
                      if (jsxNode.closingElement)
                        replacements.push(
                          fixer.replaceText(
                            jsxNode.closingElement.name,
                            `${reactNamespace}.${importedName}`,
                          ),
                        );
                    }
                  });
                }
              });
              const sourcecode = context.getSourceCode();
              const lineStartWhitespace = sourcecode.lines[
                node.loc.start.line - 1
              ].replace(/[^ \t].+/, '');
              const rangeStart =
                lineStartWhitespace.length === node.loc.start.column
                  ? node.range[0] - lineStartWhitespace.length - 1
                  : node.range[0];
              replacements.push(
                existingReactNamespace || index > 0
                  ? fixer.replaceTextRange([rangeStart, node.range[1]], '')
                  : fixer.replaceTextRange(
                      node.range,
                      `import * as ${reactNamespace} from 'react';`,
                    ),
              );
              return replacements;
            },
          });
        });
      },
    };
  },
};
