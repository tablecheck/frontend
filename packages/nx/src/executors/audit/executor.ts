import { ExecutorContext } from '@nx/devkit';

import { AuditExecutorSchema } from './schema.js';

export default async function runExecutor(
  { updatePrompts }: AuditExecutorSchema,
  context: ExecutorContext,
) {
  const metadata = context.projectsConfigurations.projects[context.projectName];
  return {
    success: await import('@tablecheck/frontend-audit').then(({ run }) =>
      run({ rootPath: metadata.root, updatePrompts }),
    ),
  };
}
