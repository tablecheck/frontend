const { cosmiconfigSync } = require('cosmiconfig');

const explorer = cosmiconfigSync('@tablecheck');

export const userConfig = (explorer.search() || { config: {} })
  .config as Partial<{
  outputBundledDepsBuild: boolean;
  isAppWithExports: boolean;
  additionalRoots: string[];
  independentLernaPackages: string[];
  lintFolderOverrides: Record<string, string[]>;
}>;
