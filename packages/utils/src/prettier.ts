import fs from 'fs-extra';
import prettier from 'prettier';

export async function writePrettyFile(filePath: string, fileContent: string) {
  const prettierOptions = await prettier.resolveConfig(process.cwd());
  fs.outputFileSync(
    filePath,
    await prettier.format(fileContent, {
      ...prettierOptions,
      filepath: filePath,
    }),
  );
}
