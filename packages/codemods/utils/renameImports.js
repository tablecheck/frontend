const getUsages = require('./getUsages');
const replaceImports = require('./replaceImports');

module.exports = function renameImports(
  root,
  api,
  packageName,
  importReplacements
) {
  const j = api.jscodeshift;

  const { newImports, currentImports } = replaceImports(
    root,
    api,
    packageName,
    importReplacements
  );

  Object.keys(currentImports).forEach((currentImportKey) => {
    getUsages(root, api, currentImports[currentImportKey]).forEach((path) => {
      j(path).replaceWith(j.identifier(newImports[currentImportKey]));
    });
  });

  return newImports;
};
