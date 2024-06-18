import { TSESTree } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';
import { RuleFix } from '@typescript-eslint/utils/ts-eslint';

type ImportDeclaration = TSESTree.ImportDeclaration;
type ImportSpecifier = TSESTree.ImportSpecifier;
type Identifier = TSESTree.Identifier;
type Node = TSESTree.Node;

export const messageId = 'incorrectImport';

function assertForbiddenImport(node: Node): asserts node is ImportDeclaration {
  if (node.type !== TSESTree.AST_NODE_TYPES.ImportDeclaration)
    throw new Error('Invalid node type');
  const importName = node.source.value;
  const isForbiddenImport = [
    /^lodash$/,
    /^@fortawesome\/(pro|free)-[a-z]+-svg-icons$/,
  ].find((matcher) => importName.match(matcher));
  if (!isForbiddenImport) throw new Error('Not a forbidden import');
}

function findNameInReferences(
  name: string,
  references: { identifier: { name: string } }[],
) {
  return references.find((r) => r.identifier.name === name);
}

function getSafeName(
  name: string,
  references: { identifier: { name: string } }[],
) {
  let offsetCount = 1;
  let safeName = name;
  let matchedReference = findNameInReferences(name, references);
  while (matchedReference) {
    safeName = `${name}${offsetCount}`;

    matchedReference = findNameInReferences(safeName, references);
    offsetCount += 1;
  }
  return safeName;
}

function renameImport(
  importName: string,
  subImportName: string,
  packageName: string,
) {
  if (importName !== 'lodash') {
    if (subImportName === packageName)
      return `import { ${subImportName} } from '${importName}/${packageName}';`;
    return `import { ${packageName} as ${subImportName} } from '${importName}/${packageName}';`;
  }
  return `import ${subImportName} from '${importName}/${packageName}';`;
}

export const forbiddenImports: TSESLint.RuleModule<typeof messageId> = {
  meta: {
    schema: [],
    type: 'suggestion',
    docs: {
      description:
        'Ensure that certain packages are using specific imports instead of using the default import',
      recommended: 'recommended',
      url: 'https://github.com/tablecheck/frontend/tree/main/packages/eslint-plugin/docs/rules/forbidden-imports.md',
    },
    fixable: 'code',
    messages: {
      [messageId]:
        'The default import "{{ importName }}" should be using a specific import',
    },
  },
  defaultOptions: [],
  create: (context) => ({
    ImportDeclaration(node) {
      if (node.specifiers.length === 0) return;
      const importName = node.source.value || '';

      const scope = context.getScope();
      for (const importSpecifier of node.specifiers) {
        try {
          assertForbiddenImport(importSpecifier.parent);
        } catch (e) {
          return;
        }
      }
      context.report({
        node,
        messageId,
        data: {
          importName,
        },
        fix(fixer) {
          const replacements: RuleFix[] = [];
          let newImports = '';
          node.specifiers.forEach((importSpecifier) => {
            const localName = importSpecifier.local.name;
            let importedName = localName;
            if ((importSpecifier as ImportSpecifier).imported?.name) {
              importedName = (importSpecifier as ImportSpecifier).imported.name;
            }
            if (
              importSpecifier.type ===
              TSESTree.AST_NODE_TYPES.ImportDefaultSpecifier
            ) {
              const replacementImports: [string, string][] = [];

              for (const ref of scope.references) {
                if (ref.identifier.name === localName) {
                  const { parent } = ref.identifier;
                  switch (parent?.type) {
                    case TSESTree.AST_NODE_TYPES.MemberExpression: {
                      const memberName = (parent.property as Identifier).name;
                      const existingReplacement = replacementImports.find(
                        ([, replacementImportName]) =>
                          replacementImportName === memberName,
                      );

                      const newImportName = existingReplacement
                        ? existingReplacement[0]
                        : getSafeName(memberName, scope.references);
                      replacements.push(
                        fixer.replaceTextRange(parent.range, newImportName),
                      );
                      if (!existingReplacement)
                        replacementImports.push([newImportName, memberName]);
                      break;
                    }
                    default:
                  }
                }
              }
              replacementImports.forEach(([subImportName, packageName]) => {
                newImports += renameImport(
                  importName,
                  subImportName,
                  packageName,
                );
              });
            } else {
              newImports += renameImport(importName, localName, importedName);
            }
          });
          replacements.push(fixer.replaceTextRange(node.range, newImports));
          return replacements;
        },
      });
    },
  }),
};
