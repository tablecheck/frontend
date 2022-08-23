import * as path from 'path';
import { cosmiconfigSync } from 'cosmiconfig';
import _jiti from 'jiti';
const jiti = _jiti;
const explorer = cosmiconfigSync('@tablecheck');
function tryRequire(id, rootDir = process.cwd()) {
    // this is to workaround ESM interop issues
    const typescriptRequire = jiti(rootDir, {
        interopDefault: true,
        esmResolve: true,
    });
    try {
        return typescriptRequire(path.join(rootDir, id));
    }
    catch (error) {
        if (error.code !== 'MODULE_NOT_FOUND') {
            console.error(`Error trying import "${id}" from "${rootDir}"`);
            console.error(error);
        }
        return undefined;
    }
}
function getConfig() {
    const tsConfig = tryRequire('./tablecheck.config.ts');
    if (tsConfig)
        return tsConfig;
    const jsConfig = tryRequire('./tablecheck.config.js');
    if (jsConfig)
        return jsConfig;
    return (explorer.search() || { config: {} }).config;
}
export const userConfig = getConfig();
//# sourceMappingURL=userConfig.js.map