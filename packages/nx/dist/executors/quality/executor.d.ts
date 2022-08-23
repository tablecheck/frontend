import { ExecutorContext } from '@nx/devkit';
export default function runExecutor(options: Omit<Parameters<typeof import('@nx/linter/src/executors/eslint/lint.impl.js').default>[0], 'format' | 'quiet' | 'force' | 'silent' | 'noEslintrc' | 'reportUnusedDisableDirectives'> & {
    checkConfig: boolean;
    checkStyles: boolean;
}, context: ExecutorContext): Promise<{
    success: boolean;
} | {
    success: boolean;
    terminalOutput: string;
}>;
