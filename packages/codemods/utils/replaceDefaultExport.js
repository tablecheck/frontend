module.exports = function replaceDefaultExport(
  root,
  api,
  packageName,
  newImportVarName
) {
  const j = api.jscodeshift;

  const source = {
    type: 'StringLiteral',
    value: packageName
  };

  const packageImports = root.find(j.ImportDeclaration, {
    source
  });

  if (packageImports.length === 0) return;

  const allSpecifiers = [];

  packageImports.forEach((packageImportPath) => {
    const packageImport = j(packageImportPath);
    packageImport.find(j.Specifier).forEach((path) => {
      if (path.node.type === 'ImportDefaultSpecifier') {
        const importName = path.node.local.name;

        j(path).remove();

        let newImport;
        if (importName === newImportVarName) {
          newImport = j.importSpecifier(j.identifier(newImportVarName));
        } else {
          newImport = j.importSpecifier(
            j.identifier(newImportVarName),
            j.identifier(importName)
          );
        }
        const currentImports = packageImport.find(j.ImportSpecifier);
        if (currentImports.length) {
          packageImport.find(j.ImportSpecifier).at(0).insertBefore(newImport);
        } else {
          packageImport.get('specifiers').push(newImport);
        }
      }
    });
    packageImport.get('specifiers').value.forEach((specifier) => {
      if (
        !allSpecifiers.find(
          ({ imported, local }) =>
            (local ? local.name : imported.name) ===
            (specifier.local ? specifier.local.name : specifier.imported.name)
        )
      ) {
        allSpecifiers.push(specifier);
      }
    });
  });

  packageImports.forEach((packageImportPath, index) => {
    const packageImport = j(packageImportPath);
    if (index > 0) {
      packageImport.remove();
    } else {
      packageImport.replaceWith(
        j.importDeclaration(allSpecifiers, source, 'value')
      );
    }
  });
};
