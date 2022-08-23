import fs from 'fs-extra';
import prettier from 'prettier';

import { paths } from './paths.js';

export function writePrettyFile(filePath: string, fileContent: string) {
  const prettierOptions = prettier.resolveConfig.sync(paths.cwd);
  fs.outputFileSync(
    filePath,
    prettier.format(fileContent, {
      ...prettierOptions,
      filepath: filePath
    })
  );
}
