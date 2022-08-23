import { __awaiter } from "tslib";
export default function runExecutor(_, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const metadata = context.projectsConfigurations.projects[context.projectName];
        const sourceRoot = metadata.sourceRoot;
        console.log('Executor ran for Precommit', _);
        return {
            success: true,
        };
    });
}
//# sourceMappingURL=executor.js.map