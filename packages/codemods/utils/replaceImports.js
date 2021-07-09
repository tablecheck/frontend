const addComment = require('./addComment');
const getUniqueIdentifier = require('./getUniqueIdentifier');
const mergeImports = require('./mergeImports');

module.exports = function replaceImports(
  root,
  api,
  packageName,
  importReplacements
) {
  const j = api.jscodeshift;

  const uniqueImportNames = Object.keys(importReplacements).reduce(
    (result, key) => {
      const currentImport = importReplacements[key];
      if (!currentImport || result[currentImport]) return result;
      return {
        ...result,
        [currentImport]: getUniqueIdentifier(root, api, currentImport)
      };
    },
    {}
  );

  const newImports = {};
  const currentImports = {};

  const packageImport = root.find(j.ImportDeclaration, {
    source: {
      type: 'StringLiteral',
      value: packageName
    }
  });

  packageImport.find(j.Specifier).forEach((path) => {
    if (path.node.type === 'ImportDefaultSpecifier') return;
    const importName = path.node.imported.name;
    const localName = path.node.local ? path.node.local.name : importName;
    if (typeof importReplacements[importName] === 'undefined') return;
    const replaceNode = j(path);
    currentImports[importName] = importName;
    newImports[importName] =
      uniqueImportNames[importReplacements[importName]] || importName;
    if (localName && localName !== importName) {
      currentImports[importName] = localName;
      newImports[importName] = localName;
    }

    if (importReplacements[importName] === null) {
      replaceNode.remove();
    } else {
      if (newImports[importName] && newImports[importName].match(/__TEMP$/gi)) {
        addComment(api, path.parent.node, 'TODO fix temp imports');
      }
      replaceNode.replaceWith(
        j.importSpecifier(
          j.identifier(importReplacements[importName]),
          j.identifier(newImports[importName])
        )
      );
    }
  });

  mergeImports(root, api, packageName);

  return { newImports, currentImports };
};
