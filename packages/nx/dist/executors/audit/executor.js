"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function runExecutor({ updatePrompts }, context) {
    const metadata = context.projectsConfigurations.projects[context.projectName];
    return {
        success: await import('execa').then(async ({ execa }) => {
            try {
                await execa('npx', [
                    '-p @tablecheck/frontend-audit',
                    'tablecheck-frontend-audit',
                    '--ci',
                    (!updatePrompts).toString(),
                ], {
                    cwd: metadata.root,
                    stdio: [process.stdin, process.stdout, 'pipe'],
                });
                return true;
            }
            catch (e) {
                console.error(e);
                return updatePrompts;
            }
        }),
    };
    return {
        success: await import('@tablecheck/frontend-audit').then(({ run }) => run({ rootPath: metadata.root, updatePrompts })),
    };
}
exports.default = runExecutor;
//# sourceMappingURL=executor.js.map