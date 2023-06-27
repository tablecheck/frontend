import { ExecutorContext } from '@nx/devkit';
import lintRun from '@nx/linter/src/executors/eslint/lint.impl';

import { configCheck } from './configs';
import { packageCheck } from './package';

export default async function runExecutor(
  options: Omit<
    Parameters<typeof lintRun>[0],
    | 'format'
    | 'quiet'
    | 'force'
    | 'silent'
    | 'noEslintrc'
    | 'reportUnusedDisableDirectives'
  > & { checkConfig: boolean; checkStyles: boolean },
  context: ExecutorContext,
) {
  const metadata = context.projectsConfigurations.projects[context.projectName];
  const root = metadata.root || context.root;
  try {
    if (options.checkConfig) configCheck(root);
    await packageCheck({ directory: root, shouldFix: options.fix });
    return await lintRun(
      {
        ...options,
        noEslintrc: false,
        format: process.env.CI ? 'junit' : 'stylish',
        quiet: !!process.env.CI,
        silent: false,
        force: false,
        reportUnusedDisableDirectives: 'error',
      },
      context,
    );
  } catch (e) {
    console.log(e as Error);
    return {
      success: false,
      terminalOutput: (e as Error).message,
    };
  }
}
