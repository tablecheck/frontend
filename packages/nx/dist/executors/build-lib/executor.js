"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function runExecutor(options, context) {
    const metadata = context.projectsConfigurations.projects[context.projectName];
    return {
        success: await import('@tablecheck/frontend-library').then(({ buildPackage }) => buildPackage({ cwd: metadata.root, ...options })),
    };
}
exports.default = runExecutor;
//# sourceMappingURL=executor.js.map