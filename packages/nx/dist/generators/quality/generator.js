"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qualityGenerator = void 0;
const path = require("path");
const devkit_1 = require("@nx/devkit");
async function qualityGenerator(tree, options) {
    const { execaOptions } = await import('@tablecheck/frontend-utils');
    const { execa } = await import('execa');
    const projectRoot = `libs/${options.name}`;
    (0, devkit_1.addProjectConfiguration)(tree, options.name, {
        root: projectRoot,
        projectType: 'library',
        sourceRoot: `${projectRoot}/src`,
        targets: {},
    });
    (0, devkit_1.addDependenciesToPackageJson)(tree, {}, {
        prettier: 'latest',
        husky: 'latest',
        commitlint: 'latest',
        '@tablecheck/commitlint-config': 'latest',
        '@tablecheck/eslint-config': 'latest',
    });
    (0, devkit_1.installPackagesTask)(tree, true, projectRoot, 'npm');
    (0, devkit_1.generateFiles)(tree, path.join(__dirname, 'files'), projectRoot, options);
    await execa('npx', ['husky', 'install'], execaOptions);
    await (0, devkit_1.formatFiles)(tree);
}
exports.qualityGenerator = qualityGenerator;
exports.default = qualityGenerator;
//# sourceMappingURL=generator.js.map