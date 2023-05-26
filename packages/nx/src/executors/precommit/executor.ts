import { ExecutorContext } from '@nx/devkit';
import { PrecommitExecutorSchema } from './schema';

export default async function runExecutor(
  _: PrecommitExecutorSchema,
  context: ExecutorContext,
) {
  const metadata = context.projectsConfigurations.projects[context.projectName];
  const sourceRoot = metadata.sourceRoot;
  console.log('Executor ran for Precommit', _);
  return {
    success: true,
  };
}
