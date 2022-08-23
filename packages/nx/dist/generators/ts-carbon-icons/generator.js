"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsCarbonIconsGenerator = void 0;
const path = require("path");
const devkit_1 = require("@nx/devkit");
const fs = require("fs-extra");
async function tsCarbonIconsGenerator(tree, options) {
    const { detectInstalledVersion } = await import('@tablecheck/frontend-utils');
    const projectRoot = (0, devkit_1.readProjectConfiguration)(tree, options.project).root;
    try {
        const carbonPackageJsonPath = detectInstalledVersion(projectRoot, '@carbon/icons-react', '11');
        const carbonIcons = (await import(path.join(carbonPackageJsonPath, '..')));
        const fileContent = `${Object.keys(carbonIcons).reduce((result, iconName) => `${result}  declare export const ${iconName}: CarbonIcon;\n`, `/* this file is generated during configuring typescript */
      declare module '@carbon/icons-react' {
        declare export type CarbonIconSize = 16 | 20 | 24 | 32;
        declare export type CarbonIcon = React.ForwardRefExoticComponent<
          {
            size?: CarbonIconSize | \`\${CarbonIconSize}\` | (string & {}) | (number & {});
          } & React.RefAttributes<SVGSVGElement>
        >;
    `)}\n}`;
        fs.outputFileSync(path.join(projectRoot, 'src', 'definitions', 'carbonIcons.d.ts'), fileContent);
        await (0, devkit_1.formatFiles)(tree);
    }
    catch (e) {
        console.warn(e);
    }
}
exports.tsCarbonIconsGenerator = tsCarbonIconsGenerator;
exports.default = tsCarbonIconsGenerator;
//# sourceMappingURL=generator.js.map