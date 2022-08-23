"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configs_js_1 = require("./configs.js");
const package_js_1 = require("./package.js");
async function runExecutor(options, context) {
    const metadata = context.projectsConfigurations.projects[context.projectName];
    const root = metadata.root || context.root;
    try {
        if (options.checkConfig)
            await (0, configs_js_1.configCheck)(root);
        await (0, package_js_1.packageCheck)({ directory: root, shouldFix: options.fix });
        return await import('@nx/linter/src/executors/eslint/lint.impl.js').then(({ default: { default: lintRun } }) => lintRun({
            ...options,
            noEslintrc: false,
            format: process.env.CI ? 'junit' : 'stylish',
            quiet: !!process.env.CI,
            silent: false,
            force: false,
            reportUnusedDisableDirectives: 'error',
        }, context));
    }
    catch (e) {
        console.log(e);
        return {
            success: false,
            terminalOutput: e.message,
        };
    }
}
exports.default = runExecutor;
//# sourceMappingURL=executor.js.map