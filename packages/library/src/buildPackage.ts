import path from 'path';
import util from 'util';

import chalk from 'chalk';
import fs from 'fs-extra';
import rollup from 'rollup';
import glob from 'glob';
import { default as typescriptPlugin } from '@rollup/plugin-typescript';
import ts from 'typescript';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { default as commonjs } from '@rollup/plugin-commonjs';
import { default as json } from '@rollup/plugin-json';
import { externals } from 'rollup-plugin-node-externals';
import {
  userConfig,
  paths,
  getArgv,
  logTaskEnd,
  logTaskStart,
  getPackageJson
} from '@tablecheck/frontend-utils';
import { isLibTypeDefinitions } from '@tablecheck/frontend-typescript';

import { jsxPlugin } from './jsxPlugin.js';

const argv = getArgv();

const tsPrinter = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

function getBundleInput(packageDirectory: string) {
  const pkgFile = fs.readJsonSync(path.join(packageDirectory, 'package.json'));
  const inputsArg = pkgFile.entries || pkgFile.entry;
  if (inputsArg) {
    const inputs = Array.isArray(inputsArg) ? inputsArg : [inputsArg];
    return inputs.map((input) => {
      const result = path.join(packageDirectory, input);
      if (!fs.existsSync(result))
        throw new Error(
          `"${
            pkgFile.entries ? 'entries' : 'entry'
          }" value ${input} does not refer to a valid file (${result})`
        );
      return result;
    });
  }
  const tsEntry = path.join(packageDirectory, 'src/index.ts');
  if (fs.existsSync(tsEntry)) return [tsEntry];
  const tsxEntry = path.join(packageDirectory, 'src/index.tsx');
  if (fs.existsSync(tsxEntry)) return [tsxEntry];
  throw new Error(
    `Package entries/entry key was not set and could not find a valid "index.ts" or "index.tsx" in "${path.join(
      packageDirectory,
      'src'
    )}"`
  );
}

function getBabelPlugin(isEsm = false) {
  return getBabelOutputPlugin({
    presets: [
      [
        '@babel/preset-env',
        {
          modules: isEsm ? false : 'cjs',
          targets: {
            chrome: '35',
            firefox: '38',
            edge: '12',
            ie: '11',
            ios: '8',
            safari: '8',
            android: '4.4'
          }
        }
      ]
    ]
  });
}

function loadRollupConfig(
  packagePath: string,
  rootPackageDirectory: string,
  packageDirectory: string,
  bundleEntries: string[],
  rollupWarnings: (rollup.RollupWarning | string)[],
  shouldBundleDependencies = false
): rollup.RollupOptions {
  const packageJson = getPackageJson(packageDirectory);
  const rollupExternalsConfig = {
    packagePath: [packagePath, path.join(rootPackageDirectory, 'package.json')],
    deps: true
  };
  const rollupTypescriptConfig = {
    tsconfig: path.join(packageDirectory, 'tsconfig.json'),
    compilerOptions: {
      isolatedModules: false
    }
  };
  const rollupConfig: rollup.RollupOptions = {
    input: bundleEntries,
    preserveModules: !shouldBundleDependencies,
    treeshake: shouldBundleDependencies,
    onwarn: (warning) => {
      // https://github.com/rollup/rollup/blob/0fa9758cb7b1976537ae0875d085669e3a21e918/src/utils/error.ts#L324
      if (warning.code === 'UNRESOLVED_IMPORT') {
        rollupWarnings.push(
          `Failed to resolve the module ${
            (warning as any).source
          } imported by ${(warning as any).importer}` +
            `\nIs the module installed? Note:` +
            `\n ↳ to inline a module into your bundle, install it to "devDependencies".` +
            `\n ↳ to depend on a module via import/require, install it to "dependencies".`
        );
        return;
      }

      if (warning.code === 'UNUSED_EXTERNAL_IMPORT') {
        console.warn(chalk.yellow('\n', warning.message));
      }
      rollupWarnings.push(warning);
    },
    plugins: [
      {
        name: 'exclude-assets',
        resolveId(filePath: string) {
          const fileExt = path.extname(filePath);
          // if fileExt is blank then it should be a "folder" import that wants an index.{js,jsx,ts,tsx} file
          if (
            fileExt &&
            ['.png', '.jpg', '.jpeg', '.gif', '.svg'].indexOf(fileExt) !== -1
          ) {
            return { id: filePath, external: true };
          }
          return null;
        }
      },
      shouldBundleDependencies ? undefined : externals(rollupExternalsConfig),
      typescriptPlugin(rollupTypescriptConfig),
      nodeResolve({
        mainFields: ['module', 'jsnext', 'main'],
        browser: true,
        // defaults + .jsx
        extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
        preferBuiltins: true
      }),
      commonjs({
        // use a regex to make sure to include eventual hoisted packages
        esmExternals: true,
        requireReturnsDefault: 'namespace'
      }),
      json(),
      jsxPlugin(
        !!(
          packageJson.dependencies?.['@emotion/react'] ||
          packageJson.peerDependencies?.['@emotion/react']
        )
      )
    ].filter((v) => !!v)
  };
  if (argv.verbose) {
    console.log(
      chalk.gray(
        `Build ${path.relative(paths.cwd, packageDirectory)}: rollup config`
      )
    );
    console.log(
      chalk.gray(
        util.inspect(
          {
            ...rollupConfig,
            plugins: [rollupExternalsConfig, rollupTypescriptConfig]
          },
          false,
          3
        )
      )
    );
  }
  return rollupConfig;
}

async function writeTypes(
  libEsmCwd: string,
  tsDefinitionFiles: string[],
  pathMatchers: ((path: string) => false | string)[],
  typeFilePath: string
) {
  const importedFiles: string[] = [];
  const foundIndex = tsDefinitionFiles.indexOf(typeFilePath);
  if (foundIndex === -1) return importedFiles;
  tsDefinitionFiles.splice(foundIndex, 1);
  const fileBuffer = await fs.readFile(typeFilePath, 'utf8');
  const node = ts.createSourceFile(
    typeFilePath,
    fileBuffer.toString(),
    ts.ScriptTarget.Latest
  );

  node.statements.forEach((statement) => {
    if (!statement) return;
    if (
      statement.kind !== ts.SyntaxKind.ImportDeclaration &&
      statement.kind !== ts.SyntaxKind.ExportDeclaration
    )
      return;
    const n = statement as ts.ImportDeclaration | ts.ExportDeclaration;
    if (!n.moduleSpecifier || !n.moduleSpecifier.getText()) {
      return;
    }
    const importName = n.moduleSpecifier.getText();
    if (importName.match(/^\.\/|^\.\.\//gi)) {
      const absolutePath = path.join(path.dirname(typeFilePath), importName);
      if (!importedFiles.includes(absolutePath)) {
        importedFiles.push(absolutePath);
      }
      return;
    }
    let relativeImportPath = importName;
    // eslint-disable-next-line no-restricted-syntax
    for (const matcher of pathMatchers) {
      const match = matcher(importName);
      if (match) {
        const absolutePath = path.join(libEsmCwd, match);
        relativeImportPath = path.relative(
          path.dirname(typeFilePath),
          absolutePath
        );
        if (relativeImportPath[0] !== '.')
          relativeImportPath = `./${relativeImportPath}`;
        if (!importedFiles.includes(absolutePath)) {
          importedFiles.push(absolutePath);
        }
        (n.moduleSpecifier as any).text = relativeImportPath;
        return;
      }
    }
  });
  await fs.writeFile(typeFilePath, tsPrinter.printFile(node));
  return importedFiles;
}

export async function buildPackage(
  libConfigPath: string,
  rootConfigPath: string
) {
  const packageDirectory = path.dirname(libConfigPath);
  const rootPackageDirectory = path.dirname(rootConfigPath);
  const packagePath = path.join(packageDirectory, 'package.json');

  if (isLibTypeDefinitions(packageDirectory)) return;
  logTaskStart(
    `Build ${
      (await import(packagePath)).name ||
      path.relative(paths.cwd, packageDirectory).trim() ||
      'library'
    }`
  );

  const packageTsconfig = fs.readJsonSync(libConfigPath);
  if (
    !packageTsconfig.compilerOptions ||
    !packageTsconfig.compilerOptions.outDir
  )
    return;

  const libCwd = path.join(
    packageDirectory,
    packageTsconfig.compilerOptions.outDir
  );
  try {
    const rollupWarnings: (string | rollup.RollupWarning)[] = [];
    const bundleEntries = getBundleInput(packageDirectory);

    logTaskStart('Building esm bundle');

    const bundle = await rollup.rollup(
      loadRollupConfig(
        packagePath,
        rootPackageDirectory,
        packageDirectory,
        bundleEntries,
        rollupWarnings
      )
    );
    if (argv.verbose) {
      console.log(
        chalk.gray(
          `Build ${path.relative(
            paths.cwd,
            packageDirectory
          )}: create rollup bundle Success`
        )
      );
    }

    await bundle.write({
      dir: libCwd,
      format: 'esm',
      globals: {
        CONFIG: 'config'
      },
      plugins: [getBabelPlugin(true)]
    });

    if (argv.verbose) {
      console.log(
        chalk.gray(
          `Build ${path.relative(paths.cwd, packageDirectory)}: esm Success`
        )
      );
    }

    logTaskEnd(true);

    if (userConfig.outputBundledDepsBuild) {
      logTaskStart('Building es5 bundle with bundled dependencies');

      const bundleEs5WithDeps = await rollup.rollup(
        loadRollupConfig(
          packagePath,
          rootPackageDirectory,
          packageDirectory,
          bundleEntries,
          rollupWarnings,
          true
        )
      );

      await bundleEs5WithDeps.write({
        file: path.join(packageDirectory, 'lib/bundle.es5.js'),
        format: 'esm',
        globals: {
          config: 'CONFIG'
        },
        plugins: [getBabelPlugin(false)]
      });

      if (argv.verbose) {
        console.log(
          chalk.gray(
            `Build ${path.relative(
              paths.cwd,
              packageDirectory
            )}: es5 bundled deps Success`
          )
        );
      }

      logTaskEnd(true);
    }

    logTaskStart('Compiling d.ts types');

    const { paths: tsPaths, baseUrl } = packageTsconfig.compilerOptions;
    const pathKeys = Object.keys(tsPaths || {});
    if (baseUrl) {
      fs.readdirSync(path.join(packageDirectory, baseUrl), {
        withFileTypes: true
      }).forEach((dirent) => {
        if (dirent.isDirectory()) pathKeys.push(`${dirent.name}/*`);
        else pathKeys.push(dirent.name.split('.').slice(0, -1).join('.'));
      });
    }
    const pathMatchers = pathKeys.map((key) => (relativePath: string) => {
      if (
        !relativePath.match(
          new RegExp(`^${key.replace(/[*/]*$/gi, '.*')}`, 'ig')
        )
      )
        return false;
      return `./${relativePath}`;
    });
    const tsDefinitionFiles = glob.sync(path.join(libCwd, '**/*.d.ts'));

    let transformFiles = bundleEntries.map((bundleEntry) =>
      path.join(
        libCwd,
        path
          .relative(path.join(packageDirectory, baseUrl), bundleEntry)
          .replace(/\.tsx?$/, '.d.ts')
      )
    );
    while (transformFiles.length) {
      // eslint-disable-next-line no-await-in-loop
      const imports = await Promise.all(
        transformFiles.map((filepath) =>
          writeTypes(libCwd, tsDefinitionFiles, pathMatchers, filepath)
        )
      );
      transformFiles = imports
        .reduce((r, importsArray) => r.concat(importsArray), [])
        .map((filepath) => {
          const withExtension = `${filepath}.d.ts`;
          const withIndex = `${filepath}/index.d.ts`;
          if (fs.existsSync(withExtension)) return withExtension;
          if (fs.existsSync(withIndex)) return withIndex;
          if (fs.existsSync(filepath)) return filepath;
          throw new Error(
            `Cannot find file for ${filepath}, check that it is not using any private variables like CONFIG`
          );
        })
        .reduce((r, filepath) => {
          if (r.includes(filepath)) return r;
          return r.concat(filepath);
        }, [] as string[]);
    }

    logTaskEnd(true);

    logTaskStart('Copying static assets');

    const { assets } = getPackageJson(packageDirectory);
    if (assets) {
      // possibly could convert to use a rollup plugin
      assets.forEach((asset) => {
        const assetPath = path.join(packageDirectory, asset);
        if (fs.existsSync(assetPath)) {
          const libPath = path.join(packageDirectory, 'lib', asset);
          fs.copySync(assetPath, libPath);
        }
      });

      if (argv.verbose) {
        console.log(
          chalk.gray(
            `Build ${path.relative(
              paths.cwd,
              packageDirectory
            )}: Copied assets from folders; ${assets.join(', ')}`
          )
        );
      }
    }

    logTaskEnd(true);

    if (argv.verbose) {
      console.log(
        chalk.gray(
          `Build ${path.relative(paths.cwd, packageDirectory)}: clean Success`
        )
      );
    }

    logTaskEnd(
      argv.verbose ? rollupWarnings.map((warn) => warn.toString()) : true
    );
  } catch (e: any) {
    logTaskEnd(false);
    if (e.frame && e.loc) {
      console.error(
        `\nRollup error: ./${path.relative(paths.cwd, e.loc.file)}@${
          e.loc.line
        }:${e.loc.column}`
      );
      console.error(chalk.red(e.message));
      console.error(e.frame);
    } else {
      console.error(
        'Rollup Error in:',
        path.relative(paths.cwd, packageDirectory)
      );
      console.error(e);
    }
    throw e;
  }
}
