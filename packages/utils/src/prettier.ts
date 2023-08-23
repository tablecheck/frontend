import { execSync } from 'child_process';

import fs from 'fs-extra';

export function outputPrettyFile(filePath: string, fileContent: string) {
  fs.outputFileSync(filePath, fileContent);
  try {
    execSync(
      `npx prettier ${[
        '-w',
        '--log-level warn',
        '--no-error-on-unmatched-pattern',
        '--ignore-unknown',
        '--cache',
      ].join(' ')} --log-level warn ${filePath}`,
      {
        stdio: 'inherit',
      },
    );
  } catch (e) {
    return { success: false };
  }
}
