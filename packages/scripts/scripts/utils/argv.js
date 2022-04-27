const chalk = require('chalk');
const execa = require('execa');
const minimist = require('minimist');
const stringSimilarity = require('string-similarity');

const icons = require('./unicodeEmoji');

const paths = require('../../config/paths');

let shouldIgnorePackageArg = false;

const argvCheck = minimist(process.argv.slice(2), {
  string: ['package'],
  default: {
    package: '*'
  }
});
if (argvCheck.package !== '*') {
  try {
    const lernaListExec = execa.sync('lerna', ['list', '--json', '--all'], {
      cwd: paths.cwd
    });
    // lerna re-formats package files
    execa.sync(
      'prettier',
      ['-u', '-w', '--loglevel=warn', 'package.json', '**/package.json'],
      { cwd: paths.cwd }
    );
    const packages = JSON.parse(lernaListExec.stdout);
    const lernaPaths = packages.map(({ location }) => location);
    if (lernaPaths.length === 0) {
      console.log(
        chalk.cyan(
          `${icons.info} Current working directory is not a lerna repository, ignoring "--package ${argvCheck.package}" argument.`
        )
      );
    } else if (lernaPaths.length > 0) {
      const packageNames = lernaPaths.map(
        (lernaPath) => lernaPath.split('/').slice(-1)[0]
      );
      const matchingPackage = packageNames.find(
        (name) => name === argvCheck.package
      );

      if (!matchingPackage) {
        console.log(
          chalk.cyan(
            `The package filter provided; "${argvCheck.package}" did not match any of the following;\n`
          )
        );
        console.group();
        console.log(
          chalk.cyan(
            packageNames
              .map(
                (lernaPath, index) =>
                  `${index > 0 && index % 8 === 0 ? '\n' : ''}${lernaPath}`
              )
              .join(', ')
          )
        );
        console.groupEnd();
        const similarMatches = stringSimilarity.findBestMatch(
          argvCheck.package,
          packageNames
        );
        console.log();
        if (
          similarMatches &&
          similarMatches.bestMatch &&
          similarMatches.bestMatch.target &&
          similarMatches.bestMatch.rating > 0
        ) {
          const closeMatches = similarMatches.ratings
            .filter(({ rating }) => rating >= 0.45)
            .sort((a, b) => a - b);
          if (closeMatches.length > 1) {
            process.stdout.write(chalk.cyan(`Did you mean one of `));
            closeMatches.forEach(({ target }, index) => {
              process.stdout.write(chalk.cyan('"'));
              process.stdout.write(target);
              process.stdout.write(chalk.cyan('"'));
              if (index < closeMatches.length - 1) {
                process.stdout.write(chalk.cyan(', '));
              }
            });
          } else {
            process.stdout.write(chalk.cyan('Did you mean "'));
            process.stdout.write(similarMatches.bestMatch.target);
            process.stdout.write(chalk.cyan('"?'));
          }
          console.log('\n');
        }
        process.exit(1);
      }
    }
  } catch (error) {
    // this probably means we aren't in a lerna repo
    console.log(
      chalk.cyan(
        `${icons.info} Current working directory is not a lerna repository, ignoring "--package ${argvCheck.package}" argument.`
      )
    );
    shouldIgnorePackageArg = true;
  }
}

function getArgv(customArgs) {
  const args = customArgs || {};
  if (!args.boolean || args.boolean.indexOf('verbose') === -1) {
    args.boolean = [...(args.boolean || []), 'verbose'];
  }
  if (!args.string || args.string.indexOf('package') === -1) {
    args.string = [...(args.string || []), 'package'];
  }
  args.default = {
    ...(args.default || {}),
    package: '*',
    verbose: false
  };
  const unknownArgs = [];
  args.unknown = args.unknown || ((arg) => unknownArgs.push(arg) && false);
  const argv = minimist(process.argv.slice(2), args);
  if (shouldIgnorePackageArg) {
    argv.package = '*';
  }
  argv._args = unknownArgs;
  if (argv.verbose) {
    console.log(chalk.gray(`argv:\n${JSON.stringify(argv, undefined, 2)}`));
  }
  return argv;
}

module.exports = {
  getArgv
};
