import path from 'path';

import {
  paths,
  logTaskEnd,
  logTaskStart,
  getArgv,
  detectInstalledVersion,
  writePrettyFile
} from '@tablecheck/scripts-utils';
import chalk from 'chalk';
import fs from 'fs-extra';

const argv = getArgv();

const carbonIconTypesFilePath = path.join(
  paths.systemCache,
  'carbonIcons.d.ts'
);

export function generateCarbonIconsTypes(): string | undefined | void {
  const carbonPackageJsonPath = detectInstalledVersion(
    '@carbon/icons-react',
    '11'
  );
  if (!carbonPackageJsonPath) return;
  logTaskStart('Generating types for @carbon/icons-react@11');
  if (
    fs.existsSync(
      path.join(
        carbonPackageJsonPath,
        '../../../@types/carbon__icons-react/package.json'
      )
    )
  ) {
    console.log(
      chalk.yellow(
        'Please uninstall `@types/carbon__icons-react` to use the generated types.'
      )
    );
  }
  const carbonIcons = require(path.join(carbonPackageJsonPath, '..'));
  const fileContent = `${Object.keys(carbonIcons).reduce(
    (result, iconName) =>
      `${result}  declare export const ${iconName}: CarbonIcon;\n`,
    `/* this file is generated during configuring typescript */
      declare module '@carbon/icons-react' {
        declare export type CarbonIconSize = 16 | 20 | 24 | 32;
        declare export type CarbonIcon = React.ForwardRefExoticComponent<
          {
            size?: CarbonIconSize | \`\${CarbonIconSize}\` | (string & {}) | (number & {});
          } & React.RefAttributes<SVGSVGElement>
        >;
    `
  )}\n}`;

  writePrettyFile(carbonIconTypesFilePath, fileContent);

  logTaskEnd(true);
  if (argv.verbose) {
    console.log('');
    console.log(chalk.gray(path.relative(paths.cwd, carbonIconTypesFilePath)));
    console.log(chalk.gray(fs.readFileSync(carbonIconTypesFilePath, 'utf8')));
  }
  return carbonIconTypesFilePath;
}
