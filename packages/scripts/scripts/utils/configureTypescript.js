const path = require('path');

const systemSettings = require('@tablecheck/scripts-utils/userConfig');
const chalk = require('chalk');
const fs = require('fs-extra');
const glob = require('glob');

const paths = require('../../config/paths');

const { getArgv } = require('./argv');
const { execaSync, execaOptions } = require('./execa');
const { getSortedLernaPaths } = require('./lerna');
const {
  writeConfigDefinition,
  systemDefinitionFilePath
} = require('./writeConfigDefinition');
const {
  writeCarbonIconTypes,
  carbonIconTypesFilePath
} = require('./writeCarbonIconTypes');

const excludeWithTests = [
  'node_modules',
  '**/*.cypress.ts',
  '**/*.cypress.tsx',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/__tests__/**/*',
  '**/__tests__/*'
];

const argv = getArgv();

function writeTsConfig(filePath, configArg, forceConfig = false) {
  let sourceFiles = [];
  const config = {
    ...configArg,
    include: configArg.include ? [...configArg.include] : undefined,
    files: configArg.files.filter((filepath) => fs.existsSync(filepath))
  };
  if (config.include) {
    if (argv.verbose) {
      console.log(
        chalk.gray('\nChecking for source files in following paths;')
      );
    }
    config.include = config.include.reduce((mappedIncludes, globOrFolder) => {
      if (
        globOrFolder.indexOf('.') === -1 ||
        globOrFolder.indexOf('*') === -1
      ) {
        return mappedIncludes.concat(
          ['**/*.ts', '**/*.tsx', '*.ts', '*.tsx', '**/*.json', '*.json'].map(
            (extension) => path.join(globOrFolder, extension)
          )
        );
      }
      return mappedIncludes.concat([globOrFolder]);
    }, []);
    config.include.forEach((globOrFolder) => {
      const matchedFiles = glob.sync(globOrFolder, {
        cwd: path.resolve(filePath, '..'),
        silent: true
      });
      sourceFiles = sourceFiles.concat(matchedFiles);
    });
    sourceFiles = sourceFiles.filter(
      (fileFilter) => !fileFilter.match(/\/lib\//)
    );
  }
  if (!forceConfig && !sourceFiles.length) {
    if (argv.verbose) {
      console.log(
        chalk.gray(
          `\nSkip Typescript config due to no ts, tsx files @ ${path.relative(
            paths.cwd,
            filePath
          )}`
        )
      );
    }
    return false;
  }
  fs.writeFileSync(filePath, JSON.stringify(config), 'utf8');
  execaSync(
    'prettier',
    ['-u', '-w', '--loglevel=warn', filePath],
    execaOptions
  );
  if (argv.verbose) {
    console.log(
      chalk.gray(
        `\nSet Typescript Config @ ${path.relative(paths.cwd, filePath)}`
      )
    );
    console.log(chalk.gray(`\n${fs.readFileSync(filePath)}`));
  }
  return true;
}

function isLibTypeDefinitions(directory) {
  const packageJson = fs.readJsonSync(path.join(directory, 'package.json'));
  if (packageJson.name.match(/^@types\//)) return true;
  if (
    packageJson.keywords &&
    packageJson.keywords.indexOf('typescript-definitions') > -1
  ) {
    return true;
  }
  return false;
}

module.exports = {
  configureLibTypescript: async (
    isBuild,
    shouldCleanLibs,
    shouldIgnorePackageArg = false,
    mode = 'esm'
  ) => {
    const packageFilter = shouldIgnorePackageArg ? '*' : argv.package;
    writeConfigDefinition();
    writeCarbonIconTypes();
    // this is gonna seem pretty weird, but here we are going to MODIFY the json tsconfig files

    // first we see if we are in a lerna repo

    // we need to use the base tsconfig.json as `references` is not inherited via extends
    // https://github.com/microsoft/TypeScript/issues/27098
    const runnerConfigPath = path.join(paths.cwd, 'tsconfig.json');
    // this needs to be in every package or the CONFIG var isn't resolved
    const files = [systemDefinitionFilePath, carbonIconTypesFilePath];
    const packageConfig = {
      extends: '@tablecheck/scripts/tsconfig/lib.json',
      exclude: isBuild ? excludeWithTests : ['node_modules'],
      include: ['src'],
      files,
      compilerOptions: {
        composite: true,
        outDir: `lib/${mode}`,
        declarationDir: mode === 'esm' ? 'lib/esm' : undefined,
        declarationMap: false,
        noEmit: !isBuild || mode === 'es5',
        rootDir: 'src',
        baseUrl: 'src'
      }
    };
    let libConfig = {
      extends: '@tablecheck/scripts/tsconfig/lib.json',
      include: [],
      references: []
    };

    const lernaPaths = await getSortedLernaPaths();

    let hasTypescript = false;
    const eslintRoots = systemSettings.additionalRoots || [];
    if (fs.existsSync(paths.storybook)) {
      eslintRoots.push('.storybook');
    }
    if (fs.existsSync(paths.cypress)) {
      eslintRoots.push('cypress');
      const compilerPaths = {
        // this let's us import cypress files from an absolute path in our component tests
        '#cypress/*': ['../cypress/*']
      };
      packageConfig.compilerOptions.paths = compilerPaths;
      writeTsConfig(
        path.join(paths.cypress, 'tsconfig.json'),
        {
          ...packageConfig,
          extends: '@tablecheck/scripts/tsconfig/base.json',
          exclude: ['node_modules'],
          include: [
            '**/*.ts',
            '../src/**/*.cypress.tsx',
            '../src/**/*.cypress.ts',
            '../src/definitions/**/*.ts'
          ],
          compilerOptions: {
            baseUrl: path.relative(paths.cypress, path.join(paths.cwd, 'src')),
            lib: ['dom', 'dom.iterable', 'esnext'],
            module: 'esnext',
            target: 'es5',
            noEmit: true,
            isolatedModules: false,
            paths: compilerPaths
          }
        },
        true
      );
    }
    if (lernaPaths.length) {
      lernaPaths.forEach((localPath) => {
        if (packageFilter && packageFilter !== '*') {
          if (localPath.split('/').slice(-1)[0] !== packageFilter) return;
        }
        const esmConfigPath = path.join(localPath, `tsconfig.json`);
        if (!writeTsConfig(esmConfigPath, packageConfig)) return;
        hasTypescript = true;
        eslintRoots.push(localPath);
        libConfig.references.push({
          path: esmConfigPath
        });
      });
      if (shouldCleanLibs) {
        if (argv.verbose) {
          console.log(chalk.gray('\nCleaning `lib` folders:'));
        }
        lernaPaths.forEach((refPath) => {
          if (packageFilter && packageFilter !== '*') {
            if (refPath.split('/').slice(-1)[0] !== packageFilter) return;
          }
          if (argv.verbose) {
            console.log(chalk.gray(`  ${refPath}`));
          }
          fs.emptyDirSync(path.join(refPath, 'lib'));
        });
      }
    } else if (eslintRoots.length === 0) {
      const esmConfigPath = path.join(paths.cwd, `tsconfig.json`);
      if (!writeTsConfig(esmConfigPath, packageConfig)) {
        throw new Error('This project is not written in typescript');
      }
      if (shouldCleanLibs) {
        if (argv.verbose) {
          console.log(chalk.gray('\nCleaning `lib` folders:'));
        }
        fs.emptyDirSync(path.join(paths.cwd, 'lib'));
      }
      return esmConfigPath;
    } else {
      eslintRoots.push('src');
      libConfig = packageConfig;
      hasTypescript = true; // probably...
    }
    if (!hasTypescript) return runnerConfigPath;
    // lerna monorepos tsc setup and eslint do not play well
    // see https://github.com/typescript-eslint/typescript-eslint/issues/1192
    writeTsConfig(
      path.join(paths.cwd, 'tsconfig.eslint.json'),
      {
        extends: '@tablecheck/scripts/tsconfig/lib.json',
        exclude: ['node_modules'],
        files,
        include: eslintRoots,
        compilerOptions: {
          noEmit: true,
          types: eslintRoots.includes('cypress')
            ? ['cypress', 'node']
            : undefined
        }
      },
      true
    );
    if (!writeTsConfig(runnerConfigPath, libConfig, true)) {
      throw new Error('This project is not written in typescript');
    }

    return runnerConfigPath;
  },
  configureAppTypescript: (isBuild) => {
    writeConfigDefinition();
    writeCarbonIconTypes();

    const include = ['src'];
    if (fs.existsSync(paths.storybook)) {
      include.push('.storybook');
    }

    const config = {
      extends: '@tablecheck/scripts/tsconfig/base.json',
      exclude: isBuild ? excludeWithTests : ['node_modules'],
      files: [systemDefinitionFilePath, carbonIconTypesFilePath],
      include,
      compilerOptions: {
        lib: ['dom', 'dom.iterable', 'esnext'],
        module: 'esnext',
        target: 'es5',
        baseUrl: 'src',
        noEmit: true
      }
    };
    const runnerConfigPath = path.join(paths.cwd, 'tsconfig.json');

    if (fs.existsSync(paths.cypress)) {
      const compilerPaths = {
        // this let's us import cypress files from an absolute path in our component tests
        '#cypress/*': ['../cypress/*']
      };
      config.compilerOptions.paths = compilerPaths;
      writeTsConfig(
        path.join(paths.cwd, 'tsconfig.eslint.json'),
        {
          ...config,
          include: include.concat(
            ['cypress'],
            systemSettings.additionalRoots || []
          ),
          compilerOptions: {
            ...config.compilerOptions,
            isolatedModules: false,
            noEmit: true,
            types: ['cypress', 'node']
          }
        },
        true
      );
      writeTsConfig(
        path.join(paths.cypress, 'tsconfig.json'),
        {
          ...config,
          exclude: ['node_modules'],
          include: [
            '**/*.ts',
            '../src/**/*.cypress.tsx',
            '../src/**/*.cypress.ts',
            '../src/definitions/**/*.ts'
          ],
          compilerOptions: {
            ...config.compilerOptions,
            baseUrl: path.relative(paths.cypress, path.join(paths.cwd, 'src')),
            isolatedModules: false,
            noEmit: true,
            types: ['cypress', 'node']
          }
        },
        true
      );
    }
    writeTsConfig(runnerConfigPath, config, true);

    return runnerConfigPath;
  },
  isLibTypeDefinitions
};
