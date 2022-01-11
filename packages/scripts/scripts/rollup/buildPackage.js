const path = require('path');
const util = require('util');

const chalk = require('chalk');
const fs = require('fs-extra');
const rollup = require('rollup');
const typescript = require('rollup-plugin-typescript2');
const { getBabelOutputPlugin } = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const externals = require('rollup-plugin-node-externals');
const { expose } = require('threads/worker');

const paths = require('../../config/paths');
const { getArgv } = require('../utils/argv');
const { isLibTypeDefinitions } = require('../utils/configureTypescript');

const { jsxPlugin } = require('./jsxPlugin');

const argv = getArgv();

function getBundleInput(packageDirectory) {
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
  if (fs.existsSync(tsEntry)) return tsEntry;
  const tsxEntry = path.join(packageDirectory, 'src/index.tsx');
  if (fs.existsSync(tsxEntry)) return tsxEntry;
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

async function buildPackage(libConfigPath, rootConfigPath) {
  const packageDirectory = path.dirname(libConfigPath);
  const rootPackageDirectory = path.dirname(rootConfigPath);
  const packagePath = path.join(packageDirectory, 'package.json');

  if (isLibTypeDefinitions(packageDirectory)) return;

  const packageTsconfig = fs.readJsonSync(libConfigPath);
  if (
    !packageTsconfig.compilerOptions ||
    !packageTsconfig.compilerOptions.outDir
  )
    return;

  const libEsmCwd = path.join(
    packageDirectory,
    packageTsconfig.compilerOptions.outDir
  );
  const libEs5Cwd = path.join(packageDirectory, 'lib/es5');
  try {
    const rollupExternalsConfig = {
      packagePath: [
        packagePath,
        path.join(rootPackageDirectory, 'package.json')
      ],
      deps: true
    };
    const rollupTypescriptConfig = {
      tsconfig: path.join(packageDirectory, 'tsconfig.json')
    };
    const rollupWarnings = [];
    const rollupConfig = {
      input: getBundleInput(packageDirectory),
      preserveModules: true,
      treeshake: false,
      onwarn: (warning) => {
        // https://github.com/rollup/rollup/blob/0fa9758cb7b1976537ae0875d085669e3a21e918/src/utils/error.ts#L324
        if (warning.code === 'UNRESOLVED_IMPORT') {
          rollupWarnings.push(
            `Failed to resolve the module ${warning.source} imported by ${warning.importer}` +
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
          resolveId(filePath) {
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
        externals(rollupExternalsConfig),
        typescript(rollupTypescriptConfig),
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
        jsxPlugin()
      ]
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
    const bundle = await rollup.rollup(rollupConfig);
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
      dir: libEsmCwd,
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

    await bundle.write({
      dir: libEs5Cwd,
      format: 'esm',
      globals: {
        config: 'CONFIG'
      },
      plugins: [getBabelPlugin(false)]
    });

    if (argv.verbose) {
      console.log(
        chalk.gray(
          `Build ${path.relative(paths.cwd, packageDirectory)}: es5 Success`
        )
      );
    }

    const { assets } = require(path.join(packageDirectory, 'package.json'));
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

    if (argv.verbose) {
      console.log(
        chalk.gray(
          `Build ${path.relative(paths.cwd, packageDirectory)}: clean Success`
        )
      );
      if (rollupWarnings) {
        console.log('Warnings: ', rollupWarnings);
      }
    }
  } catch (e) {
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

expose(buildPackage);
