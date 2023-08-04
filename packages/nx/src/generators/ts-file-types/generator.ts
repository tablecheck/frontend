import * as path from 'path';

import { formatFiles, generateFiles, Tree } from '@nx/devkit';
import { getNxProjectRoot } from '@tablecheck/frontend-utils';

import { FileTypesGeneratorSchema } from './schema';

export async function tsFileTypesGenerator(
  tree: Tree,
  schema: FileTypesGeneratorSchema,
) {
  generateFiles(
    tree,
    path.join(__dirname, 'files', schema.svgAsComponent ? 'srcWithSvg' : 'src'),
    getNxProjectRoot(tree, schema.project).projectSourceRoot,
    {},
  );
  await formatFiles(tree);
}

export default tsFileTypesGenerator;
