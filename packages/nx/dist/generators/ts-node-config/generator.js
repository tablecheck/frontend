"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsNodeConfigGenerator = void 0;
const path = require("path");
const devkit_1 = require("@nx/devkit");
const fs = require("fs-extra");
// eslint-disable-next-line @tablecheck/forbidden-imports
const lodash_1 = require("lodash");
function buildTypes(configValue) {
    if (Array.isArray(configValue))
        return `(${(0, lodash_1.uniq)(configValue.map((v) => buildTypes(v))).join(' | ')})[]`;
    switch (typeof configValue) {
        case 'object': {
            if (Array.isArray(configValue))
                return `readonly (${(0, lodash_1.uniq)(configValue.map((v) => buildTypes(v))).join(' | ')})[]`;
            return `{${Object.keys(configValue)
                .map((key) => `readonly ${key}: ${buildTypes(configValue[key])};`)
                .join('\n')}}`;
        }
        case 'bigint':
            return 'number';
        default:
            return typeof configValue;
    }
}
async function tsNodeConfigGenerator(tree, options) {
    const { detectInstalledVersion } = await import('@tablecheck/frontend-utils');
    const projectRoot = (0, devkit_1.readProjectConfiguration)(tree, options.project).root;
    try {
        detectInstalledVersion(projectRoot, 'config', '*');
        const defaultConfigFilePath = path.join(projectRoot, 'config/default.json');
        const devConfigFilePath = path.join(projectRoot, 'config/development.json');
        if (!fs.existsSync(defaultConfigFilePath))
            return;
        const defaultConfigJson = fs.readJsonSync(defaultConfigFilePath);
        const devConfigJson = (fs.existsSync(devConfigFilePath) ? fs.readJSONSync(devConfigFilePath) : {});
        const fileContent = `declare module '@tablecheck/scripts' {
        // this file is autobuilt inside configureTypescript, all changes here will be overwritten
        interface DefaultConfig ${buildTypes(defaultConfigJson)}
        export interface Config extends DefaultConfig ${buildTypes(devConfigJson)}
      
        global {
          const CONFIG: Config;
        }
      }`;
        fs.outputFileSync(path.join(projectRoot, 'src', 'definitions', 'nodeConfig.d.ts'), fileContent);
        await (0, devkit_1.formatFiles)(tree);
    }
    catch (e) {
        console.warn(e);
    }
}
exports.tsNodeConfigGenerator = tsNodeConfigGenerator;
exports.default = tsNodeConfigGenerator;
//# sourceMappingURL=generator.js.map