import { ExecutorContext } from '@nx/devkit';
import { buildPackage } from '@tablecheck/frontend-library';
import { dynamicImport } from 'tsimportlib';

import { BuildLibExecutorSchema } from './schema.js';

export default async function runExecutor(
  options: BuildLibExecutorSchema,
  context: ExecutorContext,
) {
  if (!context.projectName) {
    throw new Error('Lib build must be run on a project');
  }
  const metadata =
    context.projectsConfigurations?.projects[context.projectName];
  if (!metadata) {
    throw new Error(
      `Could not find project configuration for ${context.projectName}`,
    );
  }
  const isBuildSuccessful = await buildPackage({
    cwd: metadata.root,
    ...options,
  });

  const { publint } = (await dynamicImport(
    'publint',
    module,
    // @ts-expect-error - this is a dynamic import
  )) as typeof import('publint');

  const { messages } = await publint({
    pkgDir: metadata.root,
    /**
     * Report warnings as errors.
     */
    strict: true,
  });

  return {
    success: isBuildSuccessful && messages.length === 0,
    terminalOutput: messages
      .map((message) => {
        const { args, code, path, type } = message;
        return `${type}: ${code}
  - ${path.join('\n  - ')}

  ${JSON.stringify(args, null, 2)}`;
      })
      .join('\n'),
  };
}
