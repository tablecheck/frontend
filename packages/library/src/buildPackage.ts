import * as path from 'path';

import * as prompts from '@clack/prompts';
import { getPackageJson } from '@tablecheck/frontend-utils';
import * as fs from 'fs-extra';
import { glob } from 'glob';
import * as rollup from 'rollup';
import { PackageJson, TsConfigJson } from 'type-fest';

import { getBabelPlugin, getBundleInput, loadRollupConfig } from './rollup.js';
import { writeTypes } from './writeTypes.js';

export async function buildPackage({
  cwd,
  outputBundle,
  verbose,
}: {
  cwd: string;
  outputBundle?: boolean;
  verbose?: boolean;
}) {
  const packagePath = path.join(cwd, 'package.json');

  prompts.intro(
    `Build ${
      ((await import(packagePath)) as PackageJson).name ||
      cwd.trim() ||
      'library'
    }`,
  );

  const packageTsconfig = fs.readJsonSync(
    path.join(cwd, 'tsconfig.json'),
  ) as TsConfigJson;
  if (
    !packageTsconfig.compilerOptions ||
    !packageTsconfig.compilerOptions.outDir
  )
    return;

  const libCwd = path.join(cwd, packageTsconfig.compilerOptions.outDir);
  try {
    const rollupWarnings: (string | rollup.RollupWarning)[] = [];
    const bundleEntries = getBundleInput(cwd);

    const esmSpinner = prompts.spinner();
    esmSpinner.start('Building esm bundle');

    const bundle = await rollup.rollup(
      loadRollupConfig({
        packagePath,
        cwd,
        bundleEntries,
        rollupWarnings,
        verbose,
      }),
    );

    await bundle.write({
      dir: libCwd,
      format: 'esm',
      globals: {
        CONFIG: 'config',
      },
      plugins: [getBabelPlugin(true)],
    });

    esmSpinner.stop();

    if (outputBundle) {
      const es5Spinner = prompts.spinner();
      es5Spinner.start('Building es5 bundle with bundled dependencies');

      const bundleEs5WithDeps = await rollup.rollup(
        loadRollupConfig({
          packagePath,
          cwd,
          bundleEntries,
          rollupWarnings,
          shouldBundleDependencies: true,
          verbose,
        }),
      );

      await bundleEs5WithDeps.write({
        file: path.join(cwd, 'lib/bundle.es5.js'),
        format: 'esm',
        globals: {
          config: 'CONFIG',
        },
        plugins: [getBabelPlugin(false)],
      });
      es5Spinner.stop();
    }

    const dtsSpinner = prompts.spinner();
    dtsSpinner.start('Compiling d.ts types');

    const { paths: tsPaths, baseUrl } = packageTsconfig.compilerOptions;
    const pathKeys = Object.keys(tsPaths || {});
    if (baseUrl) {
      fs.readdirSync(path.join(cwd, baseUrl), {
        withFileTypes: true,
      }).forEach((dirent) => {
        if (dirent.isDirectory()) pathKeys.push(`${dirent.name}/*`);
        else pathKeys.push(dirent.name.split('.').slice(0, -1).join('.'));
      });
    }
    const pathMatchers = pathKeys.map((key) => (relativePath: string) => {
      if (
        !relativePath.match(
          new RegExp(`^${key.replace(/[*/]*$/gi, '.*')}`, 'ig'),
        )
      )
        return false;
      return `./${relativePath}`;
    });
    const tsDefinitionFiles = await glob(path.join(libCwd, '**/*.d.ts'));

    let transformFiles = bundleEntries.map((bundleEntry) =>
      path.join(
        libCwd,
        path
          .relative(path.join(cwd, baseUrl), bundleEntry)
          .replace(/\.tsx?$/, '.d.ts'),
      ),
    );
    while (transformFiles.length) {
      // eslint-disable-next-line no-await-in-loop
      const imports = await Promise.all(
        transformFiles.map((filepath) =>
          writeTypes(libCwd, tsDefinitionFiles, pathMatchers, filepath),
        ),
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
            `Cannot find file for ${filepath}, check that it is not using any private variables like CONFIG`,
          );
        })
        .reduce((r, filepath) => {
          if (r.includes(filepath)) return r;
          return r.concat(filepath);
        }, [] as string[]);
    }

    dtsSpinner.stop();

    const copySpinner = prompts.spinner();
    copySpinner.start('Copying static assets');

    const { assets } = getPackageJson(cwd);
    if (assets) {
      // possibly could convert to use a rollup plugin
      assets.forEach((asset) => {
        const assetPath = path.join(cwd, asset);
        if (fs.existsSync(assetPath)) {
          const libPath = path.join(cwd, 'lib', asset);
          fs.copySync(assetPath, libPath);
        }
      });
      copySpinner.stop();
    } else {
      copySpinner.stop('No assets to copy');
    }

    if (rollupWarnings.length) {
      prompts.note(rollupWarnings.map((warn) => warn.toString()).join(`\n\n`));
    }

    prompts.outro('Finished building package');
    return true;
  } catch (e: unknown) {
    const error = e as rollup.RollupError;
    if (error.frame && error.loc) {
      prompts.note(
        `${error.message}\n${error.frame}`,
        `Rollup error: ./${path.relative(cwd, error.loc.file)}@${
          error.loc.line
        }:${error.loc.column}`,
      );
    } else {
      prompts.note(e.toString(), `Rollup Error in: ${cwd}`);
    }
    prompts.cancel('Build failed');
    return false;
  }
}
