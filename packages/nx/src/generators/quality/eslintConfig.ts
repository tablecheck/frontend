import * as path from 'path';

import { Tree } from '@nx/devkit';
import * as fs from 'fs-extra';

import { getNxProjectRoot } from '../../utils/nx';
import { outputPrettyFile } from '../../utils/prettier';

function getConfigs(projectRoot: string) {
  const mapToPath = (filename: string) => path.join(projectRoot, filename);
  const nxAppConfigs = ['app', 'spec', 'lib'].map((fileType) =>
    mapToPath(`tsconfig.${fileType}.json`),
  );
  const defaultConfigs = ['tsconfig.base.json', 'tsconfig.json'].map(mapToPath);
  if (nxAppConfigs.every((config) => fs.existsSync(config))) {
    return nxAppConfigs;
  }
  return defaultConfigs.filter((config) => fs.existsSync(config));
}

function getExtends(
  eslintType:
    | 'basic'
    | 'typescript'
    | 'react'
    | 'reactTs'
    | 'cypress'
    | 'cypressTs'
    | 'component'
    | 'componentTs',
) {
  switch (eslintType) {
    case 'basic':
      return "'@tablecheck/eslint-config/basic'";
    case 'typescript':
      return "'@tablecheck/eslint-config/typescript'";
    case 'react':
      return "'@tablecheck/eslint-config/react'";
    case 'reactTs':
      return "'@tablecheck/eslint-config/react-typescript'";
    case 'cypress':
      return "'@tablecheck/eslint-config/basic', '@tablecheck/eslint-config/cypress'";
    case 'cypressTs':
      return "'@tablecheck/eslint-config/typescript', '@tablecheck/eslint-config/cypress'";
    case 'component':
      return "'@tablecheck/eslint-config/react', '@tablecheck/eslint-config/component'";
    case 'componentTs':
      return "'@tablecheck/eslint-config/react-typescript', '@tablecheck/eslint-config/component-typescript'";
    default:
      return "'@tablecheck/eslint-config'";
  }
}

export function generateEslintConfig(
  tree: Tree,
  schema: {
    project: string;
    eslintType: Parameters<typeof getExtends>[0];
  },
) {
  const projectName = schema.project;
  const { projectRoot } = getNxProjectRoot(tree, projectName);
  const projectTsConfigs =
    getConfigs(projectRoot)
      .map((tsConfig) => `'${path.relative(tree.root, tsConfig)}'`)
      .join(',') ||
    '/* could not detect tsconfig.json files, manually set them here */';
  const fileContent = `
module.exports = {
    extends: [${getExtends(schema.eslintType)}],
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
