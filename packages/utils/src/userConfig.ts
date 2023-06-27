import * as path from 'path';

import { cosmiconfigSync } from 'cosmiconfig';

const jiti = require('jiti') as (
  path: string,
  options: Record<string, boolean>,
) => <T>(importPath: string) => T;

const explorer = cosmiconfigSync('@tablecheck');

export type ProjectType = 'default' | 'cli' | 'react-framework';

export type CosmicConfigShape = {
  /**
   * Set this to true to output a single es5 file bundled build of the library.
   * This can be useful when having to deal with legacy build systems.
   */
  outputBundledDepsBuild: boolean;
  /**
   * Set this to true if your application also has exports to be consumed in another application
   */
  isAppWithExports: boolean;
  /**
   * The glob paths in this array denote extra places for the quality checkers and typescript to run/check
   */
  additionalRoots: string[];
  /**
   * These file paths should follow the same format as the `paths` array in `lerna.json`. Any packages in these paths have been marked as specifically being allowed to ignore the lerna same package versions check in the quality scripts
   */
  independentLernaPackages: string[];
  typescript: 'manual' | 'auto';
  /**
   * Rules used for setting up eslint and other quality checks (excluding typescript)
   */
  quality: Partial<{
    /**
     * Normally eslint checks files in the `src` sub-folder use this to override and provide other folders to check.
     * By passing an object you can define this specific to each lerna repository as well.
     * This is usually only used in lerna monorepos to avoid linting node_modules
     */
    folderOverrides: string[] | Record<string, string[]>;
    /**
     * This defines certain rule overrides that can be applied for different types of projects.
     * Inside a lerna monorepo the rules can be defined per sub-package.
     */
    projectType: ProjectType | Record<string, ProjectType>;
  }>;
};

function tryRequire(id: string, rootDir: string = process.cwd()) {
  // this is to workaround ESM interop issues
  const typescriptRequire = jiti(rootDir, {
    interopDefault: true,
    esmResolve: true,
  });
  try {
    return typescriptRequire<Partial<CosmicConfigShape>>(
      path.join(rootDir, id),
    );
  } catch (error: any) {
    if (error.code !== 'MODULE_NOT_FOUND') {
      console.error(`Error trying import "${id}" from "${rootDir}"`);
      console.error(error);
    }
    return undefined;
  }
}

function getConfig(): Partial<CosmicConfigShape> {
  const tsConfig = tryRequire('./tablecheck.config.ts');
  if (tsConfig) return tsConfig;
  const jsConfig = tryRequire('./tablecheck.config.js');
  if (jsConfig) return jsConfig;
  return (explorer.search() || { config: {} }).config as never;
}

export const userConfig = getConfig();
