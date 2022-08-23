import { ExecutorContext } from '@nx/devkit';
import { PrecommitExecutorSchema } from './schema';
export default function runExecutor(_: PrecommitExecutorSchema, context: ExecutorContext): Promise<{
    success: boolean;
}>;
