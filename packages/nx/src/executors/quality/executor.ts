import { ExecutorContext } from '@nx/devkit';

import { configCheck } from './configs.js';
import { packageCheck } from './package.js';

export default async function runExecutor(
  options: Omit<
    Parameters<
      typeof import('@nx/linter/src/executors/eslint/lint.impl.js').default
    >[0],
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
    if (options.checkConfig) await configCheck(root);
    await packageCheck({ directory: root, shouldFix: options.fix });
    return await import('@nx/linter/src/executors/eslint/lint.impl.js').then(
      ({ default: { default: lintRun } }) =>
        lintRun(
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
        ),
    );
  } catch (e) {
    console.log(e as Error);
    return {
      success: false,
      terminalOutput: (e as Error).message,
    };
  }
}
