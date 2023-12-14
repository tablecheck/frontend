import * as path from 'path';

import { Tree, generateFiles } from '@nx/devkit';
import fs from 'fs-extra';

type GenerateFilesFunction = (
  substitutions: Parameters<typeof generateFiles>[3],
) => void;

export function createTempFiles({
  tree,
  projectRoot,
  cacheContent,
  cacheLocation,
  createFiles,
}: {
  tree: Tree;
  projectRoot: string;
  cacheContent?: string;
  cacheLocation: string;
  createFiles: (templatePath: string) => void;
}): GenerateFilesFunction {
  const cachePath = path.join(cacheLocation, '.cache');
  const templatePath = path.join(cacheLocation, 'files');
  const generateFunction: GenerateFilesFunction = (substitutions) =>
    generateFiles(
      tree,
      templatePath,
      path.relative(tree.root, projectRoot),
      substitutions,
    );
  if (cacheContent) {
    if (fs.existsSync(cachePath)) {
      const cache = fs.readFileSync(cachePath, 'utf-8');
      if (cache === cacheContent) {
        return generateFunction;
      }
    }
    fs.writeFileSync(cachePath, cacheContent);
  }
  fs.emptyDirSync(templatePath);
  createFiles(templatePath);
  return generateFunction;
}
