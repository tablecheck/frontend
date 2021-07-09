const chalk = require('chalk');
const coreExeca = require('execa');

const paths = require('../../config/paths');

const { getArgv } = require('./argv');

const argv = getArgv();

const execaOptions = {
  cwd: paths.cwd,
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit',
  preferLocal: true
};

async function execa(command, args, options) {
  if (argv.verbose) {
    let env = '';
    if (options.env) {
      env = `${Object.keys(options.env).map(
        (key) => `${key}=${options.env[key]}`
      )} `;
    }
    console.log(chalk.gray(`\n> ${env}${command} ${args.join(' ')}\n`));
  }
  const result = await coreExeca(command, args, options);
  // apparently this can change and I don't know why, both seem to be valid...
  result.exitCode =
    (result.exitCode === undefined ? result.exitCode : result.code) || 0;
  return result;
}

function execaSync(command, args, options) {
  if (argv.verbose) {
    let env = '';
    if (options.env) {
      env = `${Object.keys(options.env).map(
        (key) => `${key}=${options.env[key]}`
      )} `;
    }
    console.log(chalk.gray(`\n> ${env}${command} ${args.join(' ')}\n`));
  }
  const result = coreExeca.sync(command, args, options);
  // apparently this can change and I don't know why, both seem to be valid...
  result.exitCode =
    (result.exitCode === undefined ? result.exitCode : result.code) || 0;
  return result;
}

module.exports = {
  execa,
  execaSync,
  execaOptions
};
