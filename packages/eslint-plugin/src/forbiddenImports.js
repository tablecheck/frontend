const messageId = 'incorrectImport';

function isInvalidImport(importName) {
  return ![/^lodash$/, /^@fortawesome\/(pro|free)-[a-z]+-svg-icons$/].find(
    (matcher) => importName.match(matcher)
  );
}

function getSafeName(name, references) {
  let offsetCount = 1;
  let safeName = name;
  let matchedReference = references.find((r) => r.identifier.name === safeName);
  while (matchedReference) {
    safeName = `${name}${offsetCount}`;
    // eslint-disable-next-line no-loop-func
    matchedReference = references.find((r) => r.identifier.name === safeName);
    offsetCount += 1;
  }
  return safeName;
}

function renameImport(importName, subImportName, packageName) {
  if (importName !== 'lodash') {
    if (subImportName === packageName)
      return `import { ${subImportName} } from '${importName}/${packageName}';`;
    return `import { ${packageName} as ${subImportName} } from '${importName}/${packageName}';`;
  }
  return `import ${subImportName} from '${importName}/${packageName}';`;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensure that certain packages are using specific imports instead of using the default import',
      category: 'ECMAScript 6',
      recommended: true
    },
    fixable: 'code',
    messages: {
      [messageId]:
        'The default import "{{ importName }}" should be using a specific import'
    }
  },
  supportsAutofix: true,
  create: (context) => ({
    ImportDeclaration(node) {
      const importName = node.source.value || '';
      if (isInvalidImport(importName)) return;

      const scope = context.getScope();
      context.report({
        node,
        messageId,
        data: {
          importName
        },
        fix(fixer) {
          const replacements = [];
          let newImports = '';
          node.specifiers.forEach((importSpecifier) => {
            if (isInvalidImport(importSpecifier.parent.source.value)) return;
            const localName = importSpecifier.local.name;
            let importedName = localName;
            if (importSpecifier.imported && importSpecifier.imported.name) {
              importedName = importSpecifier.imported.name;
            }
            if (importSpecifier.type === 'ImportDefaultSpecifier') {
              const replacementImports = [];

              for (let i = 0; i < scope.references.length; i += 1) {
                if (scope.references[i].identifier.name === localName) {
                  const { parent } = scope.references[i].identifier;
                  switch (parent.type) {
                    case 'MemberExpression': {
                      const memberName = parent.property.name;
                      const existingReplacement = replacementImports.find(
                        ([, replacementImportName]) =>
                          replacementImportName === memberName
                      );

                      const newImportName = existingReplacement
                        ? existingReplacement[0]
                        : getSafeName(parent.property.name, scope.references);
                      replacements.push(
                        fixer.replaceTextRange(parent.range, newImportName)
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
                  packageName
                );
              });
            } else {
              newImports += renameImport(importName, localName, importedName);
            }
          });
          replacements.push(fixer.replaceTextRange(node.range, newImports));
          return replacements;
        }
      });
    }
  })
};
