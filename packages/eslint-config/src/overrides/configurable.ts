import { userConfig } from '@tablecheck/frontend-utils';
import type { Linter } from 'eslint';

export const configurableRuleOverrides: Linter.ConfigOverride[] = [];

const projectTypes = userConfig?.quality?.projectType || 'default';

const projectMaps =
  typeof projectTypes === 'string'
    ? [['.', projectTypes]]
    : Object.entries(projectTypes);

projectMaps.forEach(([path, projectType]) => {
  switch (projectType) {
    case 'cli': {
      configurableRuleOverrides.push({
        files: [`${path}/**/*.{ts,tsx,js,jsx,mjs,cjs}`],
        rules: {
          'import/no-extraneous-dependencies': [
            'error',
            {
              devDependencies: true,
            },
          ],
          'import/no-dynamic-require': 'off',
          'global-require': 'off',
          'no-console': 'off',
          'promise/prefer-await-to-then': 'off',
          'promise/prefer-await-to-callbacks': 'off',
          'promise/catch-or-return': 'off',
          'promise/always-return': 'off',
          'promise/avoid-new': 'off',
          'no-underscore-dangle': 'off',
        },
      });
      break;
    }
    case 'react-framework': {
      configurableRuleOverrides.push({
        files: [`${path}/**/*.{ts,tsx,js,jsx,mjs,cjs}`],
        rules: {
          'import/no-default-export': 'warn',
        },
      });
      break;
    }
    default: {
      break;
    }
  }
});
