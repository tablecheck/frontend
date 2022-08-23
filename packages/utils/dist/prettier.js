import fs from 'fs-extra';
import prettier from 'prettier';
export function writePrettyFile(filePath, fileContent) {
    const prettierOptions = prettier.resolveConfig.sync(process.cwd());
    fs.outputFileSync(filePath, prettier.format(fileContent, {
        ...prettierOptions,
        filepath: filePath,
    }));
}
//# sourceMappingURL=prettier.js.map