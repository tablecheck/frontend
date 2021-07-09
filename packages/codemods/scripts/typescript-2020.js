const getUsages = require('../utils/getUsages');
const renameImports = require('../utils/renameImports');
/**
 * Fixes the flow - typescript renaming,
 * flow: import type { Node } from 'react';
 * typescript: import { ReactNode } from 'react';
 */
module.exports = function typescript2020(file, api) {
  const j = api.jscodeshift;

  const root = j(file.source);

  const reactImport = root.find(j.ImportDeclaration, {
    source: {
      type: 'StringLiteral',
      value: 'react'
    }
  });

  if (reactImport.size() > 0) {
    // Rename <Fragment> -> <> as auto supported now
    reactImport
      .find(j.Specifier, { imported: { name: 'Fragment' } })
      .forEach((path) => {
        const importName = (path.node.local || path.node.imported).name;
        let hasFragmentsWithArgs = false;
        getUsages(root, api, importName).forEach((varPath) => {
          if (
            varPath.parent.parent.node.type === 'JSXElement' &&
            varPath.parent.parent.node.openingElement.attributes.length
          ) {
            hasFragmentsWithArgs = true;
          } else {
            // eslint-disable-next-line no-param-reassign
            varPath.node.name = '';
          }
        });
        if (!hasFragmentsWithArgs) {
          j(path).remove();
        }
      });
  }

  renameImports(root, api, 'react', {
    Node: 'ReactNode',
    StatelessFunctionalComponent: 'FC',
    AbstractComponent: 'ComponentType'
  });

  return root.toSource();
};
