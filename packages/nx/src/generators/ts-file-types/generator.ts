import * as path from 'path';

import { formatFiles, generateFiles, Tree } from '@nx/devkit';

import { getNxProjectRoot } from '../../utils/nx';

import { FileTypesGeneratorSchema } from './schema';

export async function tsFileTypesGenerator(
  tree: Tree,
  schema: FileTypesGeneratorSchema,
) {
  const { projectSourceRoot } = getNxProjectRoot(tree, schema.project);
  generateFiles(
    tree,
    path.join(__dirname, 'files', schema.svgAsComponent ? 'srcWithSvg' : 'src'),
    path.relative(process.cwd(), projectSourceRoot),
    {},
  );
  await formatFiles(tree);
}

export default tsFileTypesGenerator;
