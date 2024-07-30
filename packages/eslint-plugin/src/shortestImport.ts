import * as path from 'path';

import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import fs from 'fs-extra';
import { type CompilerOptions } from 'typescript';

type ImportExpression = TSESTree.ImportDeclaration;
type ImportDeclaration = TSESTree.ImportExpression;

export const messageId = 'shortestImport';

const metaCache = new Map<string, RuleChecker>();

class RuleChecker {
  private baseUrl: string | undefined;

  private pathsBasePath: CompilerOptions['pathsBasePath'];

  private rootDir: string | undefined;

  private rootDirs: string[] | undefined;

  private compilerPaths: Record<string, string>;

  private pathMappings: Record<string, string>;

  private allPaths: Record<string, string>;

  get relativeBaseUrl(): string {
    return path.relative(this.pathsBasePath as string, this.baseUrl ?? '');
  }

  constructor(compilerOptions: CompilerOptions) {
    const { baseUrl, pathsBasePath, rootDir, rootDirs } = compilerOptions;

    this.baseUrl = baseUrl;
    this.pathsBasePath = pathsBasePath;
    this.rootDir = rootDir;
    this.rootDirs = rootDirs;
    this.compilerPaths = this.composeCompilerPaths(compilerOptions.paths);
    this.pathMappings = this.composePathMappings();
    this.allPaths = { ...this.compilerPaths, ...this.pathMappings };
  }

  private composeCompilerPaths(compilerPaths: CompilerOptions['paths']) {
    return Object.entries(compilerPaths ?? {}).reduce(
      (compilerPathsMap, [key, [value]]) => ({
        ...compilerPathsMap,
        [key.replace(/\*$/gi, '')]: this.relativeToBaseUrl(
          value.replace(/\/\*$/gi, '').replace(/^\.\//gi, ''),
        ),
      }),
      {},
    );
  }

  private composePathMappings() {
    return Object.fromEntries(
      Object.entries(this.composeBaseUrlPaths()).filter(
        ([key]) => !!key.trim(),
      ),
    );
  }

  private composeBaseUrlPaths() {
    if (!this.baseUrl) return {};
    return fs
      .readdirSync(this.baseUrl, {
        withFileTypes: true,
      })
      .reduce(
        (directoryMap, dirrent) => {
          if (dirrent.isDirectory())
            return {
              ...directoryMap,
              [`${dirrent.name}/`]: this.relativeToBaseUrl(
                path.join(this.relativeBaseUrl, dirrent.name),
              ),
            };
          return {
            ...directoryMap,
            [dirrent.name.replace(/\.[^.]+$/gi, '')]: this.relativeToBaseUrl(
              path
                .join(this.relativeBaseUrl, dirrent.name)
                .replace(/^\.\//gi, ''),
            ),
          };
        },
        {} as Record<string, string>,
      );
  }

  private getImportMeta(
    context: Readonly<
      TSESLint.RuleContext<'shortestImport' | 'types-failed', OptionsShape>
    >,
    node: ImportExpression | ImportDeclaration,
  ):
    | Record<string, never>
    | Record<'importPath' | 'resolvedImportPath' | 'resolvedFilePath', string> {
    if (node.source.type !== AST_NODE_TYPES.Literal) return {};
    const importPath = node.source.value;
    if (
      typeof importPath !== 'string' ||
      this.shouldNotChangeImport(importPath)
    )
      return {};
    const filename = context.getPhysicalFilename
      ? context.getPhysicalFilename()
      : context.getFilename();
    const resolvedFilePath = this.getResolvedFilePath(filename);
    const resolvedImportPath = this.resolveImport(importPath);
    return {
      importPath,
      resolvedImportPath,
      resolvedFilePath,
    };
  }

  public execute(
    context: Readonly<
      TSESLint.RuleContext<'shortestImport' | 'types-failed', OptionsShape>
    >,
    node: ImportExpression | ImportDeclaration,
  ) {
    const { importPath, resolvedImportPath, resolvedFilePath } =
      this.getImportMeta(context, node);

    if (!importPath) return;
    const relativePath = this.getRelativeImport({
      importPath,
      resolvedImportPath,
      resolvedFilePath,
    });
    const aliasPaths = this.getPathImports({
      mappings: this.compilerPaths,
      resolvedImportPath,
      importPath,
      resolvedFilePath,
    });
    const baseUrlPaths = this.getPathImports({
      mappings: this.pathMappings,
      resolvedImportPath,
      importPath,
      resolvedFilePath,
    });
    const preferredPath = this.getPreferredPath({
      resolvedFilePath,
      relativePath,
      aliasPaths,
      baseUrlPaths,
      preferredAliasPaths: context.options[0]?.preferredAlias ?? [],
    });

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

  private shouldNotChangeImport(importPath: string) {
    if (importPath.startsWith('@') || importPath === '.') return true;
    const isPathMapping = Object.keys(this.allPaths).some(
      (key) =>
        importPath.startsWith(key) ||
        importPath.startsWith(key.replace(/\/$/, '')),
    );

    if (isPathMapping) return false;
    return !importPath.startsWith('.') && !importPath.startsWith('/');
  }

  private resolveImport(importPath: string) {
    const matchedPathMappingKey = Object.keys(this.allPaths).find(
      (key) => importPath.startsWith(key) || `${importPath}/`.startsWith(key),
    );

    if (matchedPathMappingKey) {
      const base = this.allPaths[matchedPathMappingKey];
      const append = importPath
        .replace(matchedPathMappingKey.replace(/\/$/, ''), '')
        .replace(matchedPathMappingKey, '');

      return `./${path.join(base, append)}`;
    }
    return importPath;
  }

  private relativeToBaseUrl(filepath: string) {
    if (!this.baseUrl) return filepath;
    const forcedImportPath = this.forceAppend(this.baseUrl, filepath);
    return `./${path.relative(this.baseUrl, forcedImportPath)}`;
  }

  private getRelativeImport({
    importPath,
    resolvedImportPath,
    resolvedFilePath,
  }: {
    importPath: string;
    resolvedImportPath: string;
    resolvedFilePath: string;
  }) {
    if (importPath.startsWith('.')) return importPath;

    const relativePath = path.relative(
      path.dirname(resolvedFilePath),
      this.relativeToBaseUrl(resolvedImportPath),
    );

    if (relativePath.startsWith('.')) return relativePath;
    return `./${relativePath}`;
  }

  private getPathImports({
    mappings,
    importPath,
    resolvedImportPath,
    resolvedFilePath,
  }: {
    mappings: Record<string, string>;
    importPath: string;
    resolvedImportPath: string;
    resolvedFilePath: string;
  }) {
    const rootRelativeImportPath = importPath.startsWith('.')
      ? `./${path.relative(
          process.cwd(),
          path.resolve(path.dirname(resolvedFilePath), importPath),
        )}`
      : resolvedImportPath;
    return Object.entries(mappings)
      .map(([key, value]) => {
        const keyRegexp = new RegExp(
          `^${key
            .replace(/\/$/g, '')
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\/|$)`,
        );
        const hasImportMatch = importPath.match(keyRegexp);
        const hasResolvedMatch = `./${rootRelativeImportPath}`.includes(value);
        if (!hasImportMatch && !hasResolvedMatch) return undefined;
        if (hasImportMatch) return importPath;
        return rootRelativeImportPath.replace(
          new RegExp(`^.*?${value.replace(/\//gi, '\\/')}`),
          key,
        );
      })
      .map((a) => a?.replace(/\/+/gi, '/').replace(/\/$/gi, ''))
      .filter((a): a is string => !!a);
  }

  private getPreferredPath({
    resolvedFilePath,
    relativePath,
    aliasPaths,
    baseUrlPaths,
    preferredAliasPaths,
  }: {
    resolvedFilePath: string;
    relativePath: string;
    aliasPaths: string[];
    baseUrlPaths: string[];
    preferredAliasPaths: string[];
  }) {
    if (!aliasPaths.length && !baseUrlPaths.length) return relativePath;
    const arePreferredAliasPathsInvalid =
      preferredAliasPaths.length &&
      [...aliasPaths, ...baseUrlPaths].some((aliasPath) =>
        preferredAliasPaths.some((alias) => aliasPath.startsWith(alias)),
      );
    const shouldAvoidRelative =
      this.relativeGoesThroughBaseUrl(relativePath, resolvedFilePath) ||
      arePreferredAliasPathsInvalid;
    const allPathsWithLength = (aliasPaths.length ? aliasPaths : baseUrlPaths)
      .map((aliasPath) => {
        const parts = aliasPath.split('/');
        if (parts[0].match(/^[^a-z0-9]$/i))
          return {
            aliasPath,
            length: parts.length - 1,
          };
        return {
          aliasPath,
          length: parts.length,
        };
      })
      .sort((a, b) => a.length - b.length);

    const shortestAliasPath = allPathsWithLength[0];
    if (shouldAvoidRelative) return shortestAliasPath?.aliasPath;
    if (!shortestAliasPath) return relativePath;
    return this.shouldPreferRelative(relativePath, shortestAliasPath)
      ? relativePath
      : shortestAliasPath.aliasPath;
  }

  private shouldPreferRelative(
    relativePath: string,
    shortestAliasPath: { aliasPath: string; length: number },
  ): boolean {
    const shortestAliasPathLength = shortestAliasPath.length;
    const relativePathLength = relativePath.split('/').length;
    if (relativePath.startsWith('./')) {
      return relativePathLength - 1 < shortestAliasPathLength;
    }
    if (relativePath.startsWith('../../')) {
      if (relativePathLength === shortestAliasPathLength) {
        const pathParts = relativePath.split('/');
        let dotsOverPaths = 0;
        pathParts.forEach((part) => {
          if (part === '..') dotsOverPaths += 1;
          else dotsOverPaths -= 1;
        });
        return dotsOverPaths >= 0;
      }
      return relativePathLength < shortestAliasPathLength;
    }
    if (relativePath.startsWith('../')) {
      return relativePathLength <= shortestAliasPathLength;
    }
    return false;
  }

  private relativeGoesThroughBaseUrl(
    relativePath: string,
    resolvedFilePath: string,
  ) {
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

  private forceAppend(base: string, append: string) {
    const baseParts = base.split('/');
    for (let i = 0; i < baseParts.length; i += 1) {
      const lastSegments = baseParts.slice(-1 * (i + 1)).join('/');
      if (append.startsWith(lastSegments)) {
        return `/${path.join(
          ...baseParts.slice(0, -1 * (i + 1)),
          append,
        )}`.replace(/[/]+/, '/');
      }
    }
    return path.resolve(base, append);
  }

  private getResolvedFilePath(filename: string) {
    if (!filename.startsWith('/')) {
      const resolvedRoots = [this.rootDir, ...(this.rootDirs ?? [])].map(
        (potentialRoot) => {
          if (typeof potentialRoot !== 'string') return undefined;
          return [potentialRoot, this.forceAppend(potentialRoot, filename)];
        },
      );
      const match = resolvedRoots.find((tuple) => {
        if (!tuple) return false;
        const [, resolvedPath] = tuple;
        return fs.existsSync(resolvedPath);
      });

      if (!match) return filename;
      if (this.baseUrl) {
        return `./${path.relative(this.baseUrl, match[1])}`;
      }
      return `./${path.relative(match[0], match[1])}`;
    }

    // this is because sometimes `baseUrl` is lowercase (eg `/users/someone/...`)
    // and then filename is uppercase (eg `/Users/someone/...`)
    // so we need to normalise them so `path.relative` works correctly
    const pattern = `${this.baseUrl}/`
      .replace(/\/+/gi, '/')
      .replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    return filename.replace(new RegExp(pattern, 'ig'), '');
  }
}

function getRuleChecker(compilerOptions: CompilerOptions): RuleChecker {
  const cacheKey = JSON.stringify(compilerOptions.configFilePath);
  if (!metaCache.has(cacheKey)) {
    metaCache.set(cacheKey, new RuleChecker(compilerOptions));
  }
  return metaCache.get(cacheKey)!;
}

type OptionsShape = [
  | {
      preferredAlias: string[];
    }
  | undefined,
];

export const shortestImport: TSESLint.RuleModule<
  typeof messageId | 'types-failed',
  OptionsShape
> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce the consistent use of preferred import paths',
      recommended: 'stylistic',
      requiresTypeChecking: true,
      url: 'https://github.com/tablecheck/frontend/tree/main/packages/eslint-plugin/docs/rules/shortest-import.md',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          preferredAlias: {
            type: 'array',
            description:
              'A list of alias paths to prefer over relative paths, for example, providing `["~/utils"]` will prefer `~/utils/useSomething` over `../useSomething` or `./useSomething`',
            title: 'Preferred alias paths',
            items: {
              type: 'string',
            },
          },
        },
      },
    ],
    messages: {
      [messageId]: "Prefer '{{ preferredPath }}' over '{{ importPath }}'",
      'types-failed': 'Typescript needs to be enabled for this rule',
    },
  },
  defaultOptions: [undefined],
  create(context) {
    const compilerOptions =
      context.sourceCode.parserServices?.program?.getCompilerOptions();
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
    const checker = getRuleChecker(compilerOptions);

    return {
      ImportDeclaration(node) {
        checker.execute(context, node);
      },
      ImportExpression(node) {
        checker.execute(context, node);
      },
    };
  },
};
