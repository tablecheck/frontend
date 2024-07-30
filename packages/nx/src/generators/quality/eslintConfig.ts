import * as path from 'path';

import { type Tree } from '@nx/devkit';

import { getNxProjectRoot } from '../../utils/nx';
import { outputPrettyFile } from '../../utils/prettier';
import { createTempFiles } from '../../utils/tempFiles';

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
  const relativeProjectRoot = path.relative(tree.root, projectRoot);
  const ruleExtensions = getExtends(schema.eslintType);
  if (schema.includeCypressComponent) {
    ruleExtensions.push('@tablecheck/eslint-config/component');
  }
  if (schema.includeStorybook) {
    ruleExtensions.push('@tablecheck/eslint-config/storybook');
  }

  const generateFiles = createTempFiles({
    tree,
    projectRoot,
    cacheLocation: __dirname,
    createFiles: (templatePath) => {
      const fileContent = `
module.exports = {
    extends: [${ruleExtensions.map((r) => `'${r}'`).join(',')}],
    parserOptions: {
        project: [
          '${relativeProjectRoot}/tsconfig.json',
          '${relativeProjectRoot}/tsconfig.*?.json',
        ],
    },
    settings: {
      'import/resolver': {
          typescript: {
              project: [
                '${relativeProjectRoot}/tsconfig.json',
                '${relativeProjectRoot}/tsconfig.*?.json',
              ],
            },
        },
    },
    rules: {},
};
`;
      outputPrettyFile(path.join(templatePath, '.eslintrc.cjs'), fileContent);
    },
  });
  generateFiles({
    overwriteExisting: true,
  });
}
