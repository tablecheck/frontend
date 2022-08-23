import { ExecutorContext } from '@nx/devkit';
import { AuditExecutorSchema } from './schema.js';
export default function runExecutor({ updatePrompts }: AuditExecutorSchema, context: ExecutorContext): Promise<{
    success: boolean;
}>;
