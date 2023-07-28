import { execSync } from 'child_process';

import { ExecutorContext } from '@nx/devkit';
import lintRun from '@nx/linter/src/executors/eslint/lint.impl.js';

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
  const metadata =
    context.projectsConfigurations!.projects[context.projectName!];
  const root = metadata.root || context.root;
  try {
    if (options.checkConfig) configCheck(root);
    const packageCheckResult = await packageCheck({
      directory: root,
      shouldFix: options.fix,
    });
    const lintResult = await lintRun(
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

    try {
      execSync(
        `npx prettier ${[
          options.fix ? '-w' : '-c',
          '--log-level warn',
          '--no-error-on-unmatched-pattern',
          '--ignore-unknown',
          '--cache',
        ].join(' ')} --log-level warn .`,
        {
          cwd: root,
          stdio: 'inherit',
        },
      );
    } catch (e) {
      return { success: false };
    }
    return { success: lintResult.success && packageCheckResult.success };
  } catch (e) {
    console.log(e as Error);
    return {
      success: false,
      terminalOutput: (e as Error).message,
    };
  }
}
