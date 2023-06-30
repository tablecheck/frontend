import * as path from 'path';

import type {
  ImportExpression,
  ImportDeclaration,
} from '@typescript-eslint/types/dist/generated/ast-spec';
import { ExpiringCache } from '@typescript-eslint/typescript-estree/dist/parseSettings/ExpiringCache';
import { getProjectConfigFiles } from '@typescript-eslint/typescript-estree/dist/parseSettings/getProjectConfigFiles';
import { AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';
import * as fs from 'fs-extra';
import { TsConfigJson } from 'type-fest';

export const messageId = 'shortestImport' as const;

export const shortestImport: TSESLint.RuleModule<typeof messageId> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce the consistent use of preferred import paths',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
    messages: {
      [messageId]: "Prefer '{{ preferredPath }}' over '{{ importPath }}'",
    },
  },
  defaultOptions: [],
  create(context) {
    const resolvedFilePath = context.getPhysicalFilename
      ? context.getPhysicalFilename()
      : context.getFilename();
    const configs = getProjectConfigFiles(
      {
        filePath: resolvedFilePath,
        tsconfigRootDir: context.parserOptions.tsconfigRootDir,
        tsconfigMatchCache: new ExpiringCache<string, string>(1),
      },
      context.parserOptions.project || './tsconfig.json',
    ).map((configPath) => {
      const filePath = path.join(
        context.parserOptions.tsconfigRootDir,
        configPath,
      );
      return { filePath, config: fs.readJSONSync(filePath) as TsConfigJson };
    });
    const pathMappings: Record<string, string> = configs.reduce(
      (acc, { filePath, config }) => {
        const baseUrl = config.compilerOptions?.baseUrl;
        const baseUrlPaths = baseUrl
          ? fs
              .readdirSync(path.join(path.dirname(filePath), baseUrl), {
                withFileTypes: true,
              })
              .reduce((directoryMap, dirrent) => {
                if (dirrent.isDirectory())
                  return {
                    ...directoryMap,
                    [dirrent.name]: path.join(baseUrl, dirrent.name),
                  };
                return {
                  ...directoryMap,
                  [dirrent.name.replace(/\.[^.]+$/gi, '')]: path
                    .join(baseUrl, dirrent.name)
                    .replace(/^\.\//gi, ''),
                };
              }, {} as Record<string, string>)
          : {};
        const compilerPaths = Object.entries(
          config.compilerOptions.paths || {},
        ).reduce(
          (compilerPathsMap, [key, [value]]) => ({
            ...compilerPathsMap,
            [key.replace(/\/\*$/gi, '')]: value
              .replace(/\/\*$/gi, '')
              .replace(/^\.\//gi, ''),
          }),
          {},
        );

        return {
          ...acc,
          ...compilerPaths,
          ...baseUrlPaths,
        };
      },
      {},
    );
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
