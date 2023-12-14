import * as path from 'path';

import { Tree } from '@nx/devkit';

import { getNxProjectRoot } from '../../utils/nx';
import { detectInstalledVersion } from '../../utils/packageJson';
import { outputPrettyFile } from '../../utils/prettier';
import { createTempFiles } from '../../utils/tempFiles';

export function tsCarbonIconsGenerator(
  tree: Tree,
  schema: { project: string },
) {
  const { projectRoot, projectSourceRoot } = getNxProjectRoot(
    tree,
    schema.project,
  );
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
    const carbonVersion =
      // eslint-disable-next-line @typescript-eslint/no-var-requires -- await import throws segfault errors as this is common Js
      (require(carbonPackageJsonPath) as { version: string }).version;
    const cacheContent = `@carbon/icons-react@${carbonVersion}\n${projectSourceRoot}`;
    const relativeSourcePath = path.relative(projectRoot, projectSourceRoot);

    const generateFiles = createTempFiles({
      tree,
      projectRoot,
      cacheContent,
      cacheLocation: __dirname,
      createFiles: (templatePath) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires -- await import throws segfault errors as this is common Js
        const carbonIcons = require(
          path.join(carbonPackageJsonPath, '..'),
        ) as Record<string, never>;
        outputPrettyFile(
          path.join(
            templatePath,
            relativeSourcePath,
            'definitions',
            'carbonIcons.gen.d.ts',
          ),
          `// this file is generated with \`nx generate @tablecheck/nx:ts-carbon-icons ${
            schema.project
          }\`
declare module '@carbon/icons-react' {
  declare export type CarbonIconSize = 16 | 20 | 24 | 32;
  declare export type CarbonIcon = React.ForwardRefExoticComponent<
    {
      size?: CarbonIconSize | \`\${CarbonIconSize}\` | (string & {}) | (number & {});
    } & React.RefAttributes<SVGSVGElement>
  >;
${Object.keys(carbonIcons)
  .map((iconName) => `  declare export const ${iconName}: CarbonIcon;`)
  .join('\n')}
}`,
        );
      },
    });

    generateFiles({
      overwriteExisting: true,
    });
  } catch (e) {
    console.warn(e);
  }
}

export default tsCarbonIconsGenerator;
