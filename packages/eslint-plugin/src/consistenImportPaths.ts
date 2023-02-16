import { TSESLint, TSESTree } from '@typescript-eslint/utils';

export const messageId = 'consistentReactImport' as const;

export const consistentImportPaths: TSESLint.RuleModule<typeof messageId> = {
  meta: {
    schema: [],
    type: 'suggestion',
    docs: {
      description:
        'Ensure that absolute and relative path imports are correctly used',
      recommended: 'error'
    },
    fixable: 'code',
    messages: {
      [messageId]:
        "React should be imported with `import * as React from 'react';`"
    }
  },
  defaultOptions: [],
  create: (context) => {
    const cwd = context.getCwd?.();
    const filename = context.getFilename();
    const filepath = context.getPhysicalFilename?.();
    return {
      ImportDeclaration(node) {
        context.report({
          node,
          messageId
        });
      }
    };
  }
};
