import * as path from 'path';

import { cosmiconfigSync } from 'cosmiconfig';
import _jiti from 'jiti';

const jiti = _jiti as unknown as (
  path: string,
  options: Record<string, boolean>,
) => <T>(importPath: string) => T;

const explorer = cosmiconfigSync('@tablecheck');

export type ProjectType = 'default' | 'cli' | 'react-framework';

export interface CosmicConfigShape {
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
}

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
  } catch (error) {
    if ((error as { code: string }).code !== 'MODULE_NOT_FOUND') {
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
  return (explorer.search() ?? { config: {} }).config as never;
}

export const userConfig = getConfig();
