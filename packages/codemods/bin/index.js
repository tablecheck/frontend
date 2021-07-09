#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const execa = require('execa');
const glob = require('glob');
const inquirer = require('inquirer');
const startCase = require('lodash/startCase');
const minimist = require('minimist');

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  console.error(err);
  throw new Error();
});

const scriptFiles = fs.readdirSync(
  path.resolve(path.join(__dirname, '../scripts'))
);
const scripts = scriptFiles.reduce((validScripts, filename) => {
  const match = /(.+)\.js$/.exec(filename);
  if (filename !== 'runner.js' && match) {
    validScripts.push(match[1]);
  }
  return validScripts;
}, []);

const { _: args, d: dryRun } = minimist(process.argv.slice(2), {
  boolean: ['d', 'dry-run'],
  alias: {
    'dry-run': 'd'
  },
  default: {
    d: false
  }
});

let fileGlobs = args;
let scriptArg;
if (scripts.indexOf(args[0]) > -1) {
  [scriptArg, ...fileGlobs] = args;
}

const files = fileGlobs.reduce(
  (allFiles, fileGlob) => allFiles.concat(glob.sync(fileGlob)),
  []
);

if (files.length === 0) {
  console.log('No files have been passed to transform');
  process.exit(1);
}

Promise.resolve({ script: scriptArg })
  .then(({ script }) => {
    if (scripts.indexOf(script) === -1) {
      return inquirer.prompt([
        {
          type: 'list',
          name: 'script',
          message: 'Which codemod did you want to run?',
          choices: scripts.map((scriptOption) => ({
            name: startCase(scriptOption),
            value: scriptOption,
            short: scriptOption
          }))
        }
      ]);
    }
    return { script };
  })
  .then(({ script }) => {
    if (scripts.indexOf(script) === -1) {
      console.log(`Unknown codemod "${script}".`);

      process.exit(1);
      return null;
    }
    if (script === 'styleguide-to-storybook') {
      return execa('node', require.resolve(`../scripts/${script}.js`));
    }
    const execaArgs = [
      '--extensions=ts,tsx,js,jsx',
      '--parser=tsx',
      `--tc-script="${script}"`,
      // no-babel is much faster, just don't try use non node.js options...
      // especially affects prettier api usage
      '--no-babel',
      '-t',
      require.resolve(`../scripts/runner.js`)
    ];
    if (dryRun) {
      execaArgs.push('-d');
      execaArgs.push('-p');
    }

    return execa('jscodeshift', execaArgs.concat(files), {
      stdio: 'inherit',
      reject: false,
      preferLocal: true
    }).then((result) => {
      if (result.exitCode === undefined) {
        console.error(
          result.shortMessage ||
            `Message: ${result.originalMessage}\nCommand: ${result.command}`
        );
        process.exit(1);
      } else {
        process.exit(result.exitCode);
      }
    });
  });
