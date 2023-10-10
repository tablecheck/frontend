import * as path from 'path';

import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';
import fs from 'fs-extra';
import { CompilerOptions } from 'typescript';

type ImportExpression = TSESTree.ImportDeclaration;
type ImportDeclaration = TSESTree.ImportExpression;

export const messageId = 'shortestImport' as const;

const metaCache = new Map<string, RuleChecker>();

class RuleChecker {
  private baseUrl: string | undefined;

  private pathsBasePath: CompilerOptions['pathsBasePath'];

  private rootDir: string | undefined;

  private rootDirs: string[] | undefined;

  private compilerPaths: Record<string, string>;

  private pathMappings: Record<string, string>;

  private aliasPathMappings: Record<string, string>;

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
    this.aliasPathMappings = this.composeAliasPathMappings();
  }

  private composeCompilerPaths(compilerPaths: CompilerOptions['paths']) {
    return Object.entries(compilerPaths ?? {}).reduce(
      (compilerPathsMap, [key, [value]]) => ({
        ...compilerPathsMap,
        [key.replace(/\/\*$/gi, '')]: value
          .replace(/\/\*$/gi, '')
          .replace(/^\.\//gi, ''),
      }),
      {},
    );
  }

  private composePathMappings() {
    return Object.fromEntries(
      Object.entries({
        ...this.compilerPaths,
        ...this.composeBaseUrlPaths(),
      } as Record<string, string>).filter(([key]) => !!key.trim()),
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
              [dirrent.name]: path.join(this.relativeBaseUrl, dirrent.name),
            };
          return {
            ...directoryMap,
            [dirrent.name.replace(/\.[^.]+$/gi, '')]: path
              .join(this.relativeBaseUrl, dirrent.name)
              .replace(/^\.\//gi, ''),
          };
        },
        {} as Record<string, string>,
      );
  }

  private composeAliasPathMappings() {
    return this.doesCompilerPathsIncludeBaseUrl()
      ? this.compilerPaths
      : this.pathMappings;
  }

  private doesCompilerPathsIncludeBaseUrl() {
    return Object.values<string>(this.compilerPaths).some((value) =>
      value.startsWith(this.relativeBaseUrl),
    );
  }

  private getImportMeta(
    context: Readonly<
      TSESLint.RuleContext<
        'shortestImport' | 'types-failed',
        never[] | [string[]]
      >
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
      TSESLint.RuleContext<
        'shortestImport' | 'types-failed',
        never[] | [string[]]
      >
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
    const aliasPaths = this.getPathAliasImports({
      resolvedImportPath,
      resolvedFilePath,
    });
    const preferredPath = this.getPreferredPath({
      resolvedFilePath,
      relativePath,
      aliasPaths,
      avoidRelativeParents: context.options[0] || [],
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
    const isPathMapping = Object.keys(this.pathMappings).some((key) =>
      importPath.startsWith(key),
    );
    if (isPathMapping) return false;
    return !importPath.startsWith('.') && !importPath.startsWith('/');
  }

  private resolveImport(importPath: string) {
    const importParts = importPath.split('/');
    if (this.pathMappings[importParts[0]]) {
      return [this.pathMappings[importParts[0]]]
        .concat(importParts.slice(1))
        .join('/');
    }
    return importParts.join('/');
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
      resolvedImportPath,
    );
    if (relativePath.startsWith('.')) return relativePath;
    return `./${relativePath}`;
  }

  private getPathAliasImports({
    resolvedImportPath: importPath,
    resolvedFilePath,
  }: {
    resolvedImportPath: string;
    resolvedFilePath: string;
  }) {
    let resolvedImportPath = importPath;
    if (importPath.startsWith('.')) {
      resolvedImportPath = path.resolve(
        path.dirname(resolvedFilePath),
        importPath,
      );
    }
    const matchedMappings = Object.entries(this.aliasPathMappings).filter(
      ([, value]) => resolvedImportPath.includes(value),
    );
    return matchedMappings.map(([key, value]) =>
      resolvedImportPath.replace(
        new RegExp(`^.*?${value.replace(/\//gi, '\\/')}`),
        key,
      ),
    );
  }

  private getPreferredPath({
    resolvedFilePath,
    relativePath,
    aliasPaths,
    avoidRelativeParents,
  }: {
    resolvedFilePath: string;
    relativePath: string;
    aliasPaths: string[];
    avoidRelativeParents: string[];
  }) {
    if (!aliasPaths.length) return relativePath;
    const parentSlugs = relativePath.split('/').filter((s) => s === '..');
    const shouldAvoidRelative =
      this.relativeGoesThroughBaseUrl(relativePath, resolvedFilePath) ||
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

  private getResolvedFilePath(filename: string) {
    if (!filename.startsWith('/')) {
      const resolvedPaths = [
        this.pathsBasePath,
        this.rootDir,
        ...(this.rootDirs ?? []),
      ].map((potentialRoot) => {
        if (typeof potentialRoot !== 'string') return undefined;
        return [potentialRoot, path.resolve(potentialRoot, filename)];
      });
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
