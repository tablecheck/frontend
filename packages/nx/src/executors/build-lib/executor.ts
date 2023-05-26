import { ExecutorContext } from '@nx/devkit';
import { buildPackage } from '@tablecheck/frontend-library';

import { BuildLibExecutorSchema } from './schema';

export default async function runExecutor(
  options: BuildLibExecutorSchema,
  context: ExecutorContext,
) {
  const metadata = context.projectsConfigurations.projects[context.projectName];
  return {
    success: await buildPackage({ cwd: metadata.root, ...options }),
  };
}
