const getUsages = require('./getUsages');

module.exports = function mergeImports(
  root,
  api,
  packageName,
  altPackageNames = []
) {
  const j = api.jscodeshift;

  const source = {
    type: 'StringLiteral',
    value: packageName
  };

  let allComments = [];

  const packageNames = [packageName, ...altPackageNames];

  const allPackageImports = packageNames.map((altPackageName) =>
    root.find(j.ImportDeclaration, {
      source: {
        type: 'StringLiteral',
        value: altPackageName
      }
    })
  );

  const allImportsLength = allPackageImports.reduce(
    (count, imports) => count + imports.length,
    0
  );

  if (allImportsLength === 0) return;

  const allSpecifiers = [];
  const allDefaultImports = [];

  allPackageImports.forEach((packageImports) => {
    packageImports.forEach((packageImportPath) => {
      allComments = allComments.concat(
        packageImportPath.get('comments').value || []
      );
      const packageImport = j(packageImportPath);
      packageImport.get('specifiers').value.forEach((specifier) => {
        if (
          !allSpecifiers.find(
            ({ imported, local }) =>
              (local ? local.name : imported.name) ===
              (specifier.local ? specifier.local.name : specifier.imported.name)
          )
        ) {
          if (specifier.type === 'ImportDefaultSpecifier') {
            if (
              allSpecifiers[0] &&
              allSpecifiers[0].local &&
              allSpecifiers[0].local.name &&
              (!specifier.local || !specifier.local.name)
            ) {
              allDefaultImports.unshift(
                specifier.local ? specifier.local.name : specifier.imported.name
              );
              allSpecifiers.splice(0, 1, specifier);
            } else {
              if (allDefaultImports.length === 0) {
                allSpecifiers.unshift(specifier);
              }
              allDefaultImports.push(
                specifier.local ? specifier.local.name : specifier.imported.name
              );
            }
          } else {
            allSpecifiers.push(specifier);
          }
        }
      });
    });
  });

  if (allDefaultImports.length > 0) {
    const [defaultImport, ...replaceDefaultImports] = allDefaultImports;
    replaceDefaultImports.forEach((oldDefaultImport) => {
      getUsages(root, api, oldDefaultImport)
        .filter((path) => path.parent.node.type !== 'ImportSpecifier')
        .forEach((path) => {
          j(path).replaceWith(j.identifier(defaultImport));
        });
    });
  }

  let hasSetNewPackage = false;
  allPackageImports.forEach((packageImports) => {
    packageImports.forEach((packageImportPath) => {
      const packageImport = j(packageImportPath);
      if (!hasSetNewPackage) {
        hasSetNewPackage = true;
        const newImport = j.importDeclaration(allSpecifiers, source, 'value');
        newImport.comments = allComments;
        packageImport.replaceWith(newImport);
      } else {
        packageImport.remove();
      }
    });
  });
};
