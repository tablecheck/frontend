import * as path from 'path';

import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';
import fs from 'fs-extra';

type ImportExpression = TSESTree.ImportDeclaration;
type ImportDeclaration = TSESTree.ImportExpression;

export const messageId = 'shortestImport' as const;

export const shortestImport: TSESLint.RuleModule<
  typeof messageId | 'types-failed'
> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce the consistent use of preferred import paths',
      recommended: 'stylistic',
    },
    fixable: 'code',
    schema: [],
    messages: {
      [messageId]: "Prefer '{{ preferredPath }}' over '{{ importPath }}'",
      'types-failed': 'Typescript needs to be enabled for this rule',
    },
  },
  defaultOptions: [],
  create(context) {
    const compilerOptions = context
      .getSourceCode()
      .parserServices.program?.getCompilerOptions();
    if (!compilerOptions) {
      return {
        Program(node) {
          context.report({
            node,
            messageId: 'types-failed',
          });
        },
      };
    }
    const resolvedFilePath = context.getPhysicalFilename
      ? context.getPhysicalFilename()
      : context.getFilename();
    const { baseUrl, pathsBasePath } = compilerOptions;
    const relativeBaseUrl = path.relative(
      pathsBasePath as string,
      baseUrl ?? '',
    );
    const baseUrlPaths = baseUrl
      ? fs
          .readdirSync(baseUrl, {
            withFileTypes: true,
          })
          .reduce((directoryMap, dirrent) => {
            if (dirrent.isDirectory())
              return {
                ...directoryMap,
                [dirrent.name]: path.join(relativeBaseUrl, dirrent.name),
              };
            return {
              ...directoryMap,
              [dirrent.name.replace(/\.[^.]+$/gi, '')]: path
                .join(relativeBaseUrl, dirrent.name)
                .replace(/^\.\//gi, ''),
            };
          }, {} as Record<string, string>)
      : {};
    const compilerPaths = Object.entries(compilerOptions.paths ?? {}).reduce(
      (compilerPathsMap, [key, [value]]) => ({
        ...compilerPathsMap,
        [key.replace(/\/\*$/gi, '')]: value
          .replace(/\/\*$/gi, '')
          .replace(/^\.\//gi, ''),
      }),
      {},
    );

    const pathMappings: Record<string, string> = {
      ...compilerPaths,
      ...baseUrlPaths,
    };
    function resolveImport(importPath: string) {
      const importParts = importPath.split('/');
      if (pathMappings[importParts[0]]) {
        return [pathMappings[importParts[0]]]
          .concat(importParts.slice(1))
          .join('/');
      }
      return importParts.join('/');
    }
    function getPathAliasImport(importPath: string) {
      let resolvedImportPath = importPath;
      if (importPath.startsWith('.')) {
        resolvedImportPath = path.resolve(
          path.dirname(resolvedFilePath),
          importPath,
        );
      }
      const matchedMapping = Object.entries(pathMappings).find(([, value]) =>
        resolvedImportPath.includes(value),
      );
      if (!matchedMapping) return undefined;
      const [key, value] = matchedMapping;
      return resolvedImportPath.replace(
        new RegExp(`^.*?${value.replace(/\//gi, '\\/')}`),
        key,
      );
    }
    function getRelativeImport(importPath: string, resolvedImportPath: string) {
      if (importPath.startsWith('.')) return importPath;
      const relativePath = path.relative(
        path.dirname(resolvedFilePath),
        resolvedImportPath,
      );
      if (relativePath.startsWith('.')) return relativePath;
      return `./${relativePath}`;
    }
    function relativeGoesThroughBaseUrl(relativePath: string) {
      const parentPath = relativePath
        .split('/')
        .filter((part) => part === '..')
        .join('/');
      const absoluteImportPath = path.resolve(
        path.dirname(resolvedFilePath),
        relativePath,
      );
      const resolvedPathRoot = path.resolve(
        path.dirname(resolvedFilePath),
        parentPath,
      );
      return resolvedPathRoot === absoluteImportPath;
    }
    function shouldPreferRelative(
      relativePath: string,
      aliasPath: string | undefined,
    ) {
      if (!aliasPath) return true;
      if (relativeGoesThroughBaseUrl(relativePath)) return false;
      const relativeLength = relativePath.split('/').length;
      const aliasLength = aliasPath.split('/').length;
      if (relativeLength === aliasLength && relativePath.startsWith('../'))
        return false;
      return relativeLength <= aliasLength;
    }

    function checkAndFixImport(node: ImportExpression | ImportDeclaration) {
      if (node.source.type !== AST_NODE_TYPES.Literal) return;
      const importPath = node.source.value;
      if (typeof importPath !== 'string') return;
      const resolvedImport = resolveImport(importPath);
      const relativePath = getRelativeImport(importPath, resolvedImport);
      const aliasPath = getPathAliasImport(resolvedImport);
      const preferredPath = shouldPreferRelative(relativePath, aliasPath)
        ? relativePath
        : aliasPath;

      if (preferredPath === importPath) return;

      context.report({
        node,
        messageId,
        data: {
          preferredPath,
          importPath,
        },
        fix(fixer) {
          return fixer.replaceText(node.source, `'${preferredPath}'`);
        },
      });
    }

    return {
      ImportDeclaration(node) {
        checkAndFixImport(node);
      },
      ImportExpression(node) {
        checkAndFixImport(node);
      },
    };
  },
};
