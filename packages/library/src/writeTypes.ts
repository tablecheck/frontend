import * as path from 'path';

import * as fs from 'fs-extra';
import * as ts from 'typescript';

const tsPrinter = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

export async function writeTypes(
  libEsmCwd: string,
  tsDefinitionFiles: string[],
  pathMatchers: ((path: string) => false | string)[],
  typeFilePath: string,
) {
  const importedFiles: string[] = [];
  const foundIndex = tsDefinitionFiles.indexOf(typeFilePath);
  if (foundIndex === -1) return importedFiles;
  tsDefinitionFiles.splice(foundIndex, 1);
  const fileBuffer = await fs.readFile(typeFilePath, 'utf8');
  const node = ts.createSourceFile(
    typeFilePath,
    fileBuffer.toString(),
    ts.ScriptTarget.Latest,
  );

  node.statements.forEach((statement) => {
    if (!statement) return;
    if (
      statement.kind !== ts.SyntaxKind.ImportDeclaration &&
      statement.kind !== ts.SyntaxKind.ExportDeclaration
    )
      return;
    const n = statement as ts.ImportDeclaration | ts.ExportDeclaration;
    if (!n.moduleSpecifier || !n.moduleSpecifier.getText()) {
      return;
    }
    const importName = n.moduleSpecifier.getText();
    if (importName.match(/^\.\/|^\.\.\//gi)) {
      const absolutePath = path.join(path.dirname(typeFilePath), importName);
      if (!importedFiles.includes(absolutePath)) {
        importedFiles.push(absolutePath);
      }
      return;
    }
    let relativeImportPath = importName;

    for (const matcher of pathMatchers) {
      const match = matcher(importName);
      if (match) {
        const absolutePath = path.join(libEsmCwd, match);
        relativeImportPath = path.relative(
          path.dirname(typeFilePath),
          absolutePath,
        );
        if (relativeImportPath[0] !== '.')
          relativeImportPath = `./${relativeImportPath}`;
        if (!importedFiles.includes(absolutePath)) {
          importedFiles.push(absolutePath);
        }
        (n.moduleSpecifier as any).text = relativeImportPath;
        return;
      }
    }
  });
  await fs.writeFile(typeFilePath, tsPrinter.printFile(node));
  return importedFiles;
}
