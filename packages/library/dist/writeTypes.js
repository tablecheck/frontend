import * as path from 'path';
import fs from 'fs-extra';
import * as ts from 'typescript';
const tsPrinter = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
class TypesTransformer {
    sourceFile;
    libEsmCwd;
    pathMatchers;
    filePath;
    importedFiles = [];
    constructor(libEsmCwd, pathMatchers, filePath) {
        this.libEsmCwd = libEsmCwd;
        this.pathMatchers = pathMatchers;
        this.filePath = filePath;
    }
    getImportedFiles() {
        return this.importedFiles;
    }
    async read() {
        const fileBuffer = await fs.readFile(this.filePath, 'utf8');
        this.sourceFile = ts.createSourceFile(this.filePath, fileBuffer.toString(), ts.ScriptTarget.Latest);
    }
    async write() {
        await fs.writeFile(this.filePath, tsPrinter.printFile(this.sourceFile));
    }
    transform() {
        [this.sourceFile] = ts.transform(this.sourceFile, [
            (context) => (sourceFile) => ts.visitEachChild(sourceFile, (node) => this.visitNode(node, context), context),
        ]).transformed;
    }
    visitNode(node, context) {
        if (ts.isImportDeclaration(node)) {
            const newPath = this.checkAndTransformPath(node);
            const updatedImportDeclaration = ts.factory.updateImportDeclaration(node, node.modifiers, node.importClause, newPath, node.assertClause);
            return updatedImportDeclaration;
        }
        if (ts.isExportDeclaration(node)) {
            const newPath = this.checkAndTransformPath(node);
            const updatedExportDeclaration = ts.factory.updateExportDeclaration(node, node.modifiers, node.isTypeOnly, node.exportClause, newPath, node.assertClause);
            return updatedExportDeclaration;
        }
        return ts.visitEachChild(this.sourceFile, (childNode) => this.visitNode(childNode, context), context);
    }
    checkAndTransformPath(node) {
        const importPath = node.moduleSpecifier.getText(this.sourceFile);
        if (importPath.match(/^\.\/|^\.\.\//gi)) {
            const absolutePath = path.join(path.dirname(this.filePath), importPath);
            if (!this.importedFiles.includes(absolutePath)) {
                this.importedFiles.push(absolutePath);
            }
            return node.moduleSpecifier;
        }
        let relativeImportPath = importPath;
        for (const matcher of this.pathMatchers) {
            const match = matcher(importPath);
            if (match) {
                const absolutePath = path.join(this.libEsmCwd, match);
                relativeImportPath = path.relative(path.dirname(this.filePath), absolutePath);
                if (relativeImportPath[0] !== '.')
                    relativeImportPath = `./${relativeImportPath}`;
                if (!this.importedFiles.includes(absolutePath)) {
                    this.importedFiles.push(absolutePath);
                }
                return ts.factory.createStringLiteral(relativeImportPath);
            }
        }
        return node.moduleSpecifier;
    }
}
export async function writeTypes(libEsmCwd, tsDefinitionFiles, pathMatchers, typeFilePath) {
    const foundIndex = tsDefinitionFiles.indexOf(typeFilePath);
    if (foundIndex === -1)
        return [];
    tsDefinitionFiles.splice(foundIndex, 1);
    const typesTransformer = new TypesTransformer(libEsmCwd, pathMatchers, typeFilePath);
    await typesTransformer.read();
    typesTransformer.transform();
    await typesTransformer.write();
    return typesTransformer.getImportedFiles();
}
//# sourceMappingURL=writeTypes.js.map