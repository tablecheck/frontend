import * as path from 'path';

import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';
import fs from 'fs-extra';

type ImportExpression = TSESTree.ImportDeclaration;
type ImportDeclaration = TSESTree.ImportExpression;

export const messageId = 'shortestImport' as const;

export const shortestImport: TSESLint.RuleModule<
  typeof messageId | 'types-failed',
  [string[]] | never[]
> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce the consistent use of preferred import paths. A list of alias paths to prefer over relative `../` paths can also be provided',
      recommended: 'stylistic',
    },
    fixable: 'code',
    schema: [
      {
        type: 'array',
      },
    ],
    messages: {
      [messageId]: "Prefer '{{ preferredPath }}' over '{{ importPath }}'",
      'types-failed': 'Typescript needs to be enabled for this rule',
    },
  },
  defaultOptions: [],
  create(context) {
    const avoidRelativeParents = context.options[0] || [];
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
    const { baseUrl, pathsBasePath, rootDir, rootDirs } = compilerOptions;

    function getResolvedFilePath() {
      const filename = context.getPhysicalFilename
        ? context.getPhysicalFilename()
        : context.getFilename();
      if (!filename.startsWith('/')) {
        const resolvedPaths = [pathsBasePath, rootDir, ...(rootDirs ?? [])].map(
          (potentialRoot) => {
            if (typeof potentialRoot !== 'string') return undefined;
            return [potentialRoot, path.resolve(potentialRoot, filename)];
          },
        );
        const match = resolvedPaths.find((tuple) => {
          if (!tuple) return false;
          const [, resolvedPath] = tuple;
          return fs.existsSync(resolvedPath);
        });
        return match ? path.relative(match[0], match[1]) : filename;
      }

      // this is because sometimes `baseUrl` is lowercase (eg `/users/someone/...`)
      // and then filename is uppercase (eg `/Users/someone/...`)
      // so we need to normalise them so `path.relative` works correctly
      const pattern = `${baseUrl}/`
        .replace(/\/+/gi, '/')
        .replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      return filename.replace(new RegExp(pattern, 'ig'), '');
    }

    const resolvedFilePath = getResolvedFilePath();
    const relativeBaseUrl = path.relative(
      pathsBasePath as string,
      baseUrl ?? '',
    );
    const baseUrlPaths = baseUrl
      ? fs
          .readdirSync(baseUrl, {
            withFileTypes: true,
          })
          .reduce(
            (directoryMap, dirrent) => {
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
            },
            {} as Record<string, string>,
          )
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

    const doesCompilerPathsIncludeBaseUrl = Object.values<string>(
      compilerPaths,
    ).some((value) => value.startsWith(relativeBaseUrl));

    const pathMappings: Record<string, string> = {
      ...compilerPaths,
      ...baseUrlPaths,
    };
    const aliasPathMappings: Record<string, string> =
      doesCompilerPathsIncludeBaseUrl ? compilerPaths : pathMappings;
    function resolveImport(importPath: string) {
      const importParts = importPath.split('/');
      if (pathMappings[importParts[0]]) {
        return [pathMappings[importParts[0]]]
          .concat(importParts.slice(1))
          .join('/');
      }
      return importParts.join('/');
    }
    function getPathAliasImports(importPath: string) {
      let resolvedImportPath = importPath;
      if (importPath.startsWith('.')) {
        resolvedImportPath = path.resolve(
          path.dirname(resolvedFilePath),
          importPath,
        );
      }
      const matchedMappings = Object.entries(aliasPathMappings).filter(
        ([, value]) => resolvedImportPath.includes(value),
      );
      return matchedMappings.map(([key, value]) =>
        resolvedImportPath.replace(
          new RegExp(`^.*?${value.replace(/\//gi, '\\/')}`),
          key,
        ),
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
    function getPreferredPath(relativePath: string, aliasPaths: string[]) {
      if (!aliasPaths.length) return relativePath;
      const parentSlugs = relativePath.split('/').filter((s) => s === '..');
      const shouldAvoidRelative =
        relativeGoesThroughBaseUrl(relativePath) ||
        aliasPaths.some((aliasPath) => {
          if (!avoidRelativeParents.length) return false;
          const relativeRoot = aliasPath
            .split('/')
            .slice(0, -1 * parentSlugs.length)
            .join('/');
          return avoidRelativeParents.includes(relativeRoot);
        });
      const aliasWithLength = aliasPaths
        .map((aliasPath) => ({
          aliasPath,
          length: aliasPath.split('/').length,
        }))
        .concat(
          shouldAvoidRelative
            ? []
            : [
                {
                  aliasPath: relativePath,
                  length: relativePath.split('/').length,
                },
              ],
        )
        .sort((a, b) => a.length - b.length);
      return aliasWithLength[0]?.aliasPath;
    }

    function shouldNotChangeImport(importPath: string) {
      if (importPath.startsWith('@') || importPath === '.') return true;
      const isPathMapping = Object.keys(pathMappings).some((key) =>
        importPath.startsWith(key),
      );
      if (isPathMapping) return false;
      return !importPath.startsWith('.') && !importPath.startsWith('/');
    }

    function checkAndFixImport(node: ImportExpression | ImportDeclaration) {
      if (node.source.type !== AST_NODE_TYPES.Literal) return;
      const importPath = node.source.value;
      if (typeof importPath !== 'string' || shouldNotChangeImport(importPath))
        return;
      const resolvedImport = resolveImport(importPath);
      const relativePath = getRelativeImport(importPath, resolvedImport);
      const aliasPaths = getPathAliasImports(resolvedImport);
      const preferredPath = getPreferredPath(relativePath, aliasPaths);

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
