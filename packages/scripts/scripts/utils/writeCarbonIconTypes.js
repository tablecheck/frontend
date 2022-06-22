const path = require('path');

const chalk = require('chalk');
const fs = require('fs-extra');
const minimist = require('minimist');
const prettier = require('prettier');
const semver = require('semver');

const paths = require('../../config/paths');

const { logTaskEnd, logTaskStart } = require('./taskLogFormatter');

const argv = minimist(process.argv.slice(2), {
  boolean: ['verbose'],
  default: {
    verbose: false
  }
});

const systemCacheFolderName = '.@tablecheck';
const systemCacheFolderPath = path.join(paths.cwd, systemCacheFolderName);

const carbonIconTypesFilePath = path.join(
  systemCacheFolderPath,
  'carbonIcons.d.ts'
);

const carbonPackageName = '@carbon/icons-react';

function writeCarbonIconTypes() {
  const carbonPackageJsonPath = path.join(
    paths.cwd,
    'node_modules',
    carbonPackageName,
    'package.json'
  );
  if (!fs.existsSync(carbonPackageJsonPath)) {
    if (argv.verbose) {
      console.log(
        chalk.gray(`Carbon Icons not detected at '${carbonPackageJsonPath}'`)
      );
    }
    return;
  }
  const carbonPackageJson = fs.readJSONSync(carbonPackageJsonPath);
  if (
    !carbonPackageJson.version ||
    !semver.satisfies(carbonPackageJson.version, '^11')
  ) {
    if (argv.verbose) {
      console.log(
        chalk.gray(
          `Carbon Icons is not version 11, actual version '${carbonPackageJson.version}'`
        )
      );
    }
    return;
  }
  if (argv.verbose) {
    console.log(
      chalk.gray(
        `Carbon Icons at version '${carbonPackageJson.version}' detected, will generate types.`
      )
    );
  }
  logTaskStart('Generating types for @carbon/icons-react@11');
  if (
    fs.existsSync(
      path.join(
        paths.cwd,
        'node_modules/@types/carbon__icons-react/package.json'
      )
    )
  ) {
    console.log(
      chalk.yellow(
        'Please uninstall `@types/carbon__icons-react` to use the generated types.'
      )
    );
  }
  const carbonIcons = require(carbonPackageName);
  const fileContent = `${Object.keys(carbonIcons).reduce(
    (result, iconName) =>
      `${result}  declare export const ${iconName}: CarbonIcon;\n`,
    `/* this file is generated during configuring typescript */
      declare module '@carbon/icons-react' {
        declare export type CarbonIconSize = 16 | 20 | 24 | 32;
        declare export type CarbonIcon = React.ForwardRefExoticComponent<
          {
            size: CarbonIconSize | \`\${CarbonIconSize}\` | (string & {}) | (number & {});
          } & React.RefAttributes<SVGSVGElement>
        >;
    `
  )}\n}`;

  const prettierOptions = prettier.resolveConfig.sync(paths.cwd);
  fs.writeFileSync(
    carbonIconTypesFilePath,
    prettier.format(fileContent, {
      ...prettierOptions,
      filepath: carbonIconTypesFilePath
    })
  );

  logTaskEnd(true);
  if (argv.verbose) {
    console.log('');
    console.log(chalk.gray(path.relative(paths.cwd, carbonIconTypesFilePath)));
    console.log(chalk.gray(fs.readFileSync(carbonIconTypesFilePath, 'utf8')));
  }
}

module.exports = { writeCarbonIconTypes, carbonIconTypesFilePath };
