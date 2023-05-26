import path from 'path';
import util from 'util';

import chalk from 'chalk';
import fs from 'fs-extra';
import rollup from 'rollup';
import { glob } from 'glob';
import { default as typescriptPlugin } from '@rollup/plugin-typescript';
import ts from 'typescript';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { default as commonjs } from '@rollup/plugin-commonjs';
import { default as json } from '@rollup/plugin-json';
import { externals } from 'rollup-plugin-node-externals';
import { getPackageJson } from '@tablecheck/frontend-utils';
import * as prompts from '@clack/prompts';

import { jsxPlugin } from './jsxPlugin.js';

export function getBundleInput(cwd: string) {
  const pkgFile = fs.readJsonSync(path.join(cwd, 'package.json'));
  const inputsArg = pkgFile.entries || pkgFile.entry;
  if (inputsArg) {
    const inputs = Array.isArray(inputsArg) ? inputsArg : [inputsArg];
    return inputs.map((input) => {
      const result = path.join(cwd, input);
      if (!fs.existsSync(result))
        throw new Error(
          `"${
            pkgFile.entries ? 'entries' : 'entry'
          }" value ${input} does not refer to a valid file (${result})`,
        );
      return result;
    });
  }
  const tsEntry = path.join(cwd, 'src/index.ts');
  if (fs.existsSync(tsEntry)) return [tsEntry];
  const tsxEntry = path.join(cwd, 'src/index.tsx');
  if (fs.existsSync(tsxEntry)) return [tsxEntry];
  throw new Error(
    `Package entries/entry key was not set and could not find a valid "index.ts" or "index.tsx" in "${path.join(
      cwd,
      'src',
    )}"`,
  );
}

export function getBabelPlugin(isEsm = false) {
  return getBabelOutputPlugin({
    presets: [
      [
        '@babel/preset-env',
        {
          modules: isEsm ? false : 'cjs',
          targets: {
            chrome: '83',
            firefox: '83',
            edge: '80',
            ios: '12',
            safari: '12',
            opera: '62',
            android: '5',
          },
        },
      ],
    ],
  });
}

export function loadRollupConfig({
  packagePath,
  cwd,
  bundleEntries,
  rollupWarnings,
  shouldBundleDependencies,
  verbose,
}: {
  packagePath: string;
  cwd: string;
  bundleEntries: string[];
  rollupWarnings: (rollup.RollupWarning | string)[];
  shouldBundleDependencies?: boolean;
  verbose?: boolean;
}): rollup.RollupOptions {
  const packageJson = getPackageJson(cwd);
  const rollupExternalsConfig = {
    packagePath: [packagePath],
    deps: true,
  };
  const rollupTypescriptConfig = {
    tsconfig: path.join(cwd, 'tsconfig.json'),
    compilerOptions: {
      isolatedModules: false,
    },
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
            `\n ↳ to depend on a module via import/require, install it to "dependencies".`,
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
        },
      },
      shouldBundleDependencies ? undefined : externals(rollupExternalsConfig),
      typescriptPlugin(rollupTypescriptConfig),
      nodeResolve({
        mainFields: ['module', 'jsnext', 'main'],
        browser: true,
        // defaults + .jsx
        extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
        preferBuiltins: true,
      }),
      commonjs({
        // use a regex to make sure to include eventual hoisted packages
        esmExternals: true,
        requireReturnsDefault: 'namespace',
      }),
      json(),
      jsxPlugin(
        !!(
          packageJson.dependencies?.['@emotion/react'] ||
          packageJson.peerDependencies?.['@emotion/react']
        ),
      ),
    ].filter((v) => !!v),
  };
  if (verbose) {
    console.log(chalk.gray(`Build ${cwd}: rollup config`));
    console.log(
      chalk.gray(
        util.inspect(
          {
            ...rollupConfig,
            plugins: [rollupExternalsConfig, rollupTypescriptConfig],
          },
          false,
          3,
        ),
      ),
    );
  }
  return rollupConfig;
}
