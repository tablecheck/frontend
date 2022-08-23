import * as path from 'path';
import fs from 'fs-extra';
import * as glob from 'glob';
export function isLerna() {
    const lernaPath = path.resolve(path.join(process.cwd(), 'lerna.json'));
    return fs.existsSync(lernaPath);
}
function lernaList() {
    const lernaConfig = fs.readJSONSync(path.join(process.cwd(), 'lerna.json'));
    const packages = lernaConfig.packages || [];
    return packages.reduce((acc, pattern) => acc.concat(glob.sync(pattern, { cwd: process.cwd() })), []);
}
let cachedLernaPaths;
export function getLernaPaths() {
    if (cachedLernaPaths)
        return cachedLernaPaths;
    if (!isLerna()) {
        cachedLernaPaths = [];
    }
    else {
        cachedLernaPaths = lernaList();
    }
    return cachedLernaPaths;
}
//# sourceMappingURL=lerna.js.map