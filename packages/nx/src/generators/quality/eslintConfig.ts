import * as path from 'path';

import { Tree } from '@nx/devkit';

import { getNxProjectRoot } from '../../utils/nx';
import { outputPrettyFile } from '../../utils/prettier';

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
      return ['@tablecheck/eslint-config/basic'];
    case 'typescript':
      return ['@tablecheck/eslint-config/typescript'];
    case 'react':
      return ['@tablecheck/eslint-config/react'];
    case 'reactTs':
      return ['@tablecheck/eslint-config/react-typescript'];
    case 'cypress':
      return [
        '@tablecheck/eslint-config/basic',
        '@tablecheck/eslint-config/cypress',
      ];
    case 'cypressTs':
      return [
        '@tablecheck/eslint-config/typescript',
        '@tablecheck/eslint-config/cypress',
      ];
    default:
      return ['@tablecheck/eslint-config'];
  }
}

export function generateEslintConfig(
  tree: Tree,
  schema: {
    project: string;
    eslintType: Parameters<typeof getExtends>[0];
    includeCypressComponent?: boolean;
    includeStorybook?: boolean;
  },
) {
  const projectName = schema.project;
  const { projectRoot } = getNxProjectRoot(tree, projectName);
  const ruleExtensions = getExtends(schema.eslintType);
  if (schema.includeCypressComponent) {
    ruleExtensions.push('@tablecheck/eslint-config/component');
  }
  if (schema.includeStorybook) {
    ruleExtensions.push('@tablecheck/eslint-config/storybook');
  }
  const fileContent = `
module.exports = {
    extends: [${ruleExtensions.join(',')}],
    parserOptions: {
        project: [
          '${projectRoot}/tsconfig.json',
          '${projectRoot}/tsconfig.*?.json',
        ],
    },
    settings: {
      'import/resolver': {
          typescript: {
              project: [
                '${projectRoot}/tsconfig.json',
                '${projectRoot}/tsconfig.*?.json',
              ],
            },
        },
    },
    rules: {},
};
`;
  outputPrettyFile(path.join(projectRoot, '.eslintrc.cjs'), fileContent);
}
