import { ExecutorContext } from '@nx/devkit';
import { BuildLibExecutorSchema } from './schema.js';
export default function runExecutor(options: BuildLibExecutorSchema, context: ExecutorContext): Promise<{
    success: boolean;
}>;
