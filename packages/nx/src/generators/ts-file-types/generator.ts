import * as path from 'path';

import { formatFiles, generateFiles, Tree } from '@nx/devkit';

import { FileTypesGeneratorSchema } from './schema';

export async function tsFileTypesGenerator(
  tree: Tree,
  schema: FileTypesGeneratorSchema,
) {
  generateFiles(
    tree,
    path.join(__dirname, 'files', schema.svgAsComponent ? 'srcWithSvg' : 'src'),
    path.relative(process.cwd(), path.join(tree.root, 'src')),
    {},
  );
  await formatFiles(tree);
}

export default tsFileTypesGenerator;
