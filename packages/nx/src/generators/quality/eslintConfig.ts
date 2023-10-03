import * as path from 'path';

import { Tree } from '@nx/devkit';
import { getNxProjectRoot, outputPrettyFile } from '@tablecheck/frontend-utils';
import * as fs from 'fs-extra';

function getConfigs(projectRoot: string) {
  const mapToPath = (filename: string) => path.join(projectRoot, filename);
  const nxAppConfigs = ['tsconfig.app.json', 'tsconfig.spec.json'].map(
    mapToPath,
  );
  const defaultConfigs = ['tsconfig.base.json', 'tsconfig.json'].map(mapToPath);
  if (nxAppConfigs.every((config) => fs.existsSync(config))) {
    return nxAppConfigs;
  }
  return defaultConfigs.filter((config) => fs.existsSync(config));
}

export function generateEslintConfig(tree: Tree, projectName: string) {
  const { projectRoot } = getNxProjectRoot(tree, projectName);
  const projectTsConfigs =
    getConfigs(projectRoot)
      .map((tsConfig) => `'${path.relative(tree.root, tsConfig)}'`)
      .join(',') ||
    '/* could not detect tsconfig.json files, manually set them here */';
  const fileContent = `
module.exports = {
    extends: ['@tablecheck/eslint-config'],
    parserOptions: {
        project: [${projectTsConfigs}],
    },
    settings: {
      'import/resolver': {
          typescript: {
              project: [${projectTsConfigs}],
            },
        },
    },
    rules: {},
};
`;
  outputPrettyFile(path.join(projectRoot, '.eslintrc.cjs'), fileContent);
}
