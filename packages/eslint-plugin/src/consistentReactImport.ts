import { TSESLint, TSESTree } from '@typescript-eslint/utils';

export const messageId = 'consistentReactImport' as const;

export const consistentReactImport: TSESLint.RuleModule<typeof messageId> = {
  meta: {
    schema: [],
    type: 'suggestion',
    docs: {
      description: 'Ensure that react is always imported and used consistently',
      recommended: 'error',
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
        if (node.specifiers[0].type === 'ImportNamespaceSpecifier') {
          existingReactNamespace = node.specifiers[0].local.name;
          return;
        }
        importNodes.push(node);
      },
      'Program:exit': function () {
        const scope = context.getScope();
        const reactNamespace = existingReactNamespace || 'React';
        importNodes.forEach((node, index) => {
          context.report({
            node,
            messageId,
            fix(fixer) {
              const replacements = [];

              function recursivelyUpdateVariableUsage(
                updateScope: typeof scope,
                localName: string,
                importedName: string,
              ) {
                const { variables, childScopes } = updateScope;
                if (updateScope.type !== 'global') {
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
                for (let i = 0; i < childScopes.length; i += 1) {
                  recursivelyUpdateVariableUsage(
                    childScopes[i],
                    localName,
                    importedName,
                  );
                }
              }

              node.specifiers.forEach((importSpecifier) => {
                const localName = importSpecifier.local.name;
                let importedName = localName;
                // @ts-expect-error
                if (importSpecifier.imported && importSpecifier.imported.name) {
                  // @ts-expect-error
                  importedName = importSpecifier.imported.name;
                }
                if (importSpecifier.type !== 'ImportDefaultSpecifier') {
                  recursivelyUpdateVariableUsage(
                    scope,
                    localName,
                    importedName,
                  );
                  jsxElements.forEach((jsxNode) => {
                    // @ts-expect-error
                    if (jsxNode.openingElement.name.name === localName) {
                      replacements.push(
                        fixer.replaceText(
                          jsxNode.openingElement.name,
                          `${reactNamespace}.${importedName}`,
                        ),
                      );
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
