import type { buildPackage } from '@tablecheck/frontend-library';

export type BuildLibExecutorSchema = Omit<
  Parameters<typeof buildPackage>[0],
  'cwd'
>;
