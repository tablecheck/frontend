"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra");
function update(host) {
    const src = path.join(__dirname, 'files', 'pre-commit');
    const dest = path.join(host.root, '.husky', 'pre-commit');
    const oldFile = fs.readFileSync(dest, 'utf-8');
    const newFile = fs.readFileSync(src, 'utf-8');
    console.log(`Updated ${dest}`);
    if (oldFile !== newFile) {
        console.log(`  - old file backed up to ${dest}.old`);
        fs.writeFileSync(`${dest}.old`, oldFile);
    }
    fs.copyFileSync(src, dest);
}
exports.default = update;
//# sourceMappingURL=upgrade-to-nx.js.map