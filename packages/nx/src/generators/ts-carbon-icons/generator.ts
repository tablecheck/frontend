import * as path from 'path';

import { Tree, getProjects } from '@nx/devkit';
import {
  detectInstalledVersion,
  outputPrettyFile,
} from '@tablecheck/frontend-utils';

export async function tsCarbonIconsGenerator(
  tree: Tree,
  schema: { project: string },
) {
  const project = getProjects(tree).get(schema.project);
  if (!project) {
    console.warn(`Project ${schema.project} not found`);
    return;
  }
  const projectRoot = path.join(tree.root, project.root);
  try {
    let carbonPackageJsonPath: string;
    try {
      carbonPackageJsonPath = detectInstalledVersion(
        projectRoot,
        '@carbon/icons-react',
        '11',
      );
    } catch (e) {
      carbonPackageJsonPath = detectInstalledVersion(
        tree.root,
        '@carbon/icons-react',
        '11',
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires -- await import throws segfault errors as this is common Js
    const carbonIcons = require(path.join(
      carbonPackageJsonPath,
      '..',
    )) as Record<string, never>;
    const fileContent = `${Object.keys(carbonIcons).reduce(
      (result, iconName) =>
        `${result}  declare export const ${iconName}: CarbonIcon;\n`,
      `// this file is generated with \`nx generate @tablecheck/nx:ts-carbon-icons ${schema.project}\`
      declare module '@carbon/icons-react' {
        declare export type CarbonIconSize = 16 | 20 | 24 | 32;
        declare export type CarbonIcon = React.ForwardRefExoticComponent<
          {
            size?: CarbonIconSize | \`\${CarbonIconSize}\` | (string & {}) | (number & {});
          } & React.RefAttributes<SVGSVGElement>
        >;
    `,
    )}\n}`;
    const definitionsPath = project.sourceRoot
      ? path.join(project.sourceRoot, 'definitions')
      : 'definitions';
    await outputPrettyFile(
      path.join(projectRoot, definitionsPath, 'carbonIcons.gen.d.ts'),
      fileContent,
    );
  } catch (e) {
    console.warn(e);
  }
}

export default tsCarbonIconsGenerator;
