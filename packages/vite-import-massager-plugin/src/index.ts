import MagicString from 'magic-string';
import { type Plugin } from 'vite';

interface TransformConfig {
  /**
   * List of packages in node_modules that should also have their source code transformed
   */
  transformPackages?: string[];
  packageName: string;
  /**
   * This function transforms how we take the used variable and resolve it to the postfix import path.
   * By default this will append the variable name to the end of the import path.
   * For example;
   * `import { Text } from 'icons'` would pass `Text` as the `importName` argument.
   * `import _ from 'lodash'` and subsequent `_.merge()` would pass `merge` as the `importName` argument.
   * Note that the new import path expects to point to a file with a default export.
   */
  importTransform?: (importName: string) => string;
  /**
   * This function transforms how the import is written, by default we assume a default export.
   * For example;
   * `import { Text } from 'icons'` would be transformed to `import Text from 'icons/Text'` by default.
   * With the value `exportTransform: (exportName) => `{ ${exportName} }` it would be transformed to `import { Text } from 'icons/Text'`.
   * @param importName
   * @returns
   */
  exportTransform?: (importName: string, alias?: string) => string;
}

// eslint-disable-next-line import/no-default-export
export default class ImportMassagingPlugin implements Plugin {
  public name = 'import-massaging';

  public configs: TransformConfig[];

  /**
   * @param configs list of package names or transform configs to transform imports
   */
  constructor(configs: (string | TransformConfig)[]) {
    this.configs = configs.map((c) =>
      typeof c === 'string' ? { packageName: c } : c,
    );
    this.transform = this.transform.bind(this);
  }

  public transform(code: string, id: string) {
    if (!this.shouldTransform(code, id)) {
      return { code, map: null };
    }
    const source = new MagicString(code);
    for (const config of this.configs) {
      const escapedPackageName = config.packageName.replace(/\//gi, '\\/');
      source.replaceAll(
        new RegExp(
          `import {([^}]+)} from (['"])${escapedPackageName}['"];?`,
          'gi',
        ),
        (_, importsString: string, quote: string) => {
          const imports = importsString.split(',');
          let result = '';
          for (const importString of imports) {
            if (!importString.trim()) continue;
            const [importName, alias] = importString
              .split(' as ')
              .map((s) => s.trim());
            result += this.buildImport({
              config,
              importName,
              quote,
              alias,
            });
          }
          return result;
        },
      );
      const usagesReplacements: {
        start: number;
        end: number;
        content: string;
      }[] = [];
      source.replaceAll(
        new RegExp(
          `import (?:\\* as )?([a-zA-Z0-9_]+) from (['"])${escapedPackageName}['"];?`,
          'gi',
        ),
        (_, groupImport: string, quote: string) => {
          const usagesRegexp = new RegExp(
            `\\b${groupImport}\\.([a-zA-Z0-9_]+)`,
            'gi',
          );
          const imports: string[] = [];
          let usage = usagesRegexp.exec(code);
          while (usage) {
            const [full, usageName] = usage;
            const varName = `__${config.packageName.replace(
              /[^a-z]+/gi,
              '_',
            )}_${usageName}`;
            const importCode = this.buildImport({
              config,
              importName: usageName,
              varName,
              quote,
            });
            if (!imports.includes(importCode)) {
              imports.push(importCode);
            }
            usagesReplacements.push({
              start: usage.index,
              end: usage.index + full.length,
              content: varName,
            });
            usage = usagesRegexp.exec(code);
          }
          return imports.join('');
        },
      );
      usagesReplacements.forEach((replacement) => {
        source.overwrite(
          replacement.start,
          replacement.end,
          replacement.content,
        );
      });
    }

    return {
      code: source.toString(),
      map: source.generateMap({ hires: true }),
    };
  }

  private shouldTransform(code: string, id: string) {
    const isNodeModules = id.includes('/node_modules/');
    if (!isNodeModules) {
      return /\.[cm]?[tj]sx?$/.test(id) && this.includesImport(code);
    }
    const isTransformPackage = this.configs.some((c) =>
      c.transformPackages?.some((pkg) => id.includes(pkg)),
    );
    return isTransformPackage && this.includesImport(code);
  }

  private includesImport(code: string) {
    return this.configs.some((c) => code.includes(c.packageName));
  }

  private buildImport({
    config,
    importName,
    varName,
    quote,
    alias,
  }: {
    config: TransformConfig;
    importName: string;
    quote: string;
    varName?: string;
    alias?: string;
  }) {
    const importTransform = config.importTransform ?? ((i) => `/${i}`);
    const exportTransform = config.exportTransform ?? ((i, a) => a || i);
    return `import ${exportTransform(
      varName || importName,
      alias,
    )} from ${quote}${config.packageName}${importTransform(
      importName,
    )}${quote};`;
  }
}
