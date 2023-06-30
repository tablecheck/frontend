import { ExecutorContext } from '@nx/devkit';

import { BuildLibExecutorSchema } from './schema.js';

export default async function runExecutor(
  options: BuildLibExecutorSchema,
  context: ExecutorContext,
) {
  const metadata = context.projectsConfigurations.projects[context.projectName];
  return {
    success: await import('@tablecheck/frontend-library').then(
      ({ buildPackage }) => buildPackage({ cwd: metadata.root, ...options }),
    ),
  };
}
