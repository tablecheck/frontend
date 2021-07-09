const addComment = require('../utils/addComment');
const getIdentifierUsages = require('../utils/getIdentifierUsages');
const mergeImports = require('../utils/mergeImports');

module.exports = function tablekitUtils3Transform(file, api) {
  const j = api.jscodeshift;

  const root = j(file.source);

  mergeImports(root, api, '@tablekit/utils', [
    '@tablekit/utils/lib/types',
    '@tablekit/utils/types'
  ]);

  const utilsImport = root.find(j.ImportDeclaration, {
    source: {
      type: 'StringLiteral',
      value: '@tablekit/utils'
    }
  });

  if (utilsImport.size() === 0) {
    return file.source;
  }

  const variantImports = [];
  utilsImport
    .find(j.Specifier, { imported: { name: 'variant' } })
    .forEach((path) => {
      variantImports.push(path.node.local.name);
      j(path).remove();
    });

  if (variantImports.length === 0) return file.source;

  const newImport = variantImports[0];

  let isValidVariantUsed = false;
  variantImports.forEach((variantVariableIdentifier) => {
    getIdentifierUsages(root, api, variantVariableIdentifier).forEach(
      (path) => {
        if (path.parent.node.arguments && path.parent.node.arguments[0]) {
          const propProperty = path.parent.node.arguments[0].properties.find(
            ({ key }) => key.name === 'prop'
          );
          if (propProperty.value.type === 'StringLiteral') {
            isValidVariantUsed = true;
          } else {
            addComment(
              api,
              path.parent.node,
              'TODO non string prop values are no longer supported.'
            );
          }
        }
        j(path).replaceWith(j.identifier(newImport));
      }
    );
  });

  if (isValidVariantUsed)
    utilsImport.at(0).forEach((utilImportPath) => {
      if (newImport !== 'variant') {
        utilImportPath.node.specifiers.push(
          j.importSpecifier(j.identifier('variant'), j.identifier(newImport))
        );
      } else {
        utilImportPath.node.specifiers.push(
          j.importSpecifier(j.identifier('variant'))
        );
      }
    });

  mergeImports(root, api, '@tablekit/utils');
  return root.toSource();
};
