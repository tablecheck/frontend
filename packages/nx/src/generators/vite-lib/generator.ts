import { Tree } from '@nx/devkit';
import { determineProjectNameAndRootOptions } from '@nx/devkit/src/generators/project-name-and-root-utils';
import { libraryGeneratorInternal } from '@nx/js/src/generators/library/library';

import { qualityGenerator } from '../quality/generator';

export async function viteLibGenerator(
  tree: Tree,
  options: Parameters<typeof libraryGeneratorInternal>[1],
) {
  await libraryGeneratorInternal(tree, {
    ...options,
    compiler: 'tsc',
    bundler: 'tsc',
    includeBabelRc: false,
    js: false,
    skipTypeCheck: false,
    skipTsConfig: false,
    linter: 'none',
    setParserOptionsProject: false,
    strict: true,
  });

  const { projectName } = await determineProjectNameAndRootOptions(tree, {
    name: options.name,
    projectType: 'library',
    directory: options.directory,
    importPath: options.importPath,
    projectNameAndRootFormat: options.projectNameAndRootFormat,
    rootProject: options.rootProject,
    callingGenerator: '@tablecheck/nx:vite-lib',
  });

  await qualityGenerator(tree, {
    project: projectName,
    eslintType: 'reactTs',
    svgAsComponent: false,
  });
}

export default viteLibGenerator;
