import { ExecutorContext } from '@nx/devkit';
import { run } from '@tablecheck/frontend-audit';

import { AuditExecutorSchema } from './schema';

export default async function runExecutor(
  { updatePrompts }: AuditExecutorSchema,
  context: ExecutorContext,
) {
  const metadata = context.projectsConfigurations.projects[context.projectName];
  return {
    success: await run({ rootPath: metadata.root, updatePrompts }),
  };
}
