import * as path from 'path';

import { formatFiles, readProjectConfiguration, Tree } from '@nx/devkit';
import * as fs from 'fs-extra';

import type { TsCarbonIconsGeneratorSchema } from './schema.js';

export async function tsCarbonIconsGenerator(
  tree: Tree,
  options: TsCarbonIconsGeneratorSchema,
) {
  const { detectInstalledVersion } = await import('@tablecheck/frontend-utils');
  const projectRoot = readProjectConfiguration(tree, options.project).root;
  try {
    const carbonPackageJsonPath = detectInstalledVersion(
      projectRoot,
      '@carbon/icons-react',
      '11',
    );
    const carbonIcons = (await import(
      path.join(carbonPackageJsonPath, '..')
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
    fs.outputFileSync(
      path.join(projectRoot, 'src', 'definitions', 'carbonIcons.d.ts'),
      fileContent,
    );
    await formatFiles(tree);
  } catch (e) {
    console.warn(e);
  }
}

export default tsCarbonIconsGenerator;
