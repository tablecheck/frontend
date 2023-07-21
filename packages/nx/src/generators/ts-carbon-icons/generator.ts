import * as path from 'path';

import { Tree } from '@nx/devkit';
import {
  detectInstalledVersion,
  outputPrettyFile,
} from '@tablecheck/frontend-utils';

export async function tsCarbonIconsGenerator(tree: Tree) {
  const projectRoot = tree.root;
  try {
    const carbonPackageJsonPath = detectInstalledVersion(
      projectRoot,
      '@carbon/icons-react',
      '11',
    );
    const carbonIcons = require(path.join(
      carbonPackageJsonPath,
      '..',
    )) as Record<string, never>;
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
    `,
    )}\n}`;
    await outputPrettyFile(
      path.join(projectRoot, 'src', 'definitions', 'carbonIcons.d.ts'),
      fileContent,
    );
  } catch (e) {
    console.warn(e);
  }
}

export default tsCarbonIconsGenerator;
