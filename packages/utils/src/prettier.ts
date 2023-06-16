import * as fs from 'fs-extra';
import * as prettier from 'prettier';

export function writePrettyFile(filePath: string, fileContent: string) {
  const prettierOptions = prettier.resolveConfig.sync(process.cwd());
  fs.outputFileSync(
    filePath,
    prettier.format(fileContent, {
      ...prettierOptions,
      filepath: filePath,
    }),
  );
}
