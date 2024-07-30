import path from 'path';

import { getProjects, type Tree } from '@nx/devkit';

export function getNxProjectRoot(tree: Tree, projectName: string) {
  const project = getProjects(tree).get(projectName);
  if (!project) {
    throw new Error(`Project ${projectName} not found`);
  }
  const projectRoot = path.join(tree.root, project.root);
  return {
    projectRoot,
    projectSourceRoot: project.sourceRoot
      ? path.join(tree.root, project.sourceRoot)
      : projectRoot,
  };
}
