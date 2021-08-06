const path = require('path');

const chalk = require('chalk');
const flatten = require('flat');
const fs = require('fs-extra');

const paths = require('../../config/paths');

const icons = require('./unicodeEmoji');

function configCheck() {
  const configDirPath = path.join(paths.cwd, 'config');
  if (fs.existsSync(configDirPath)) {
    const defaultConfigPath = path.join(configDirPath, 'default.json');
    const configs = fs.readdirSync(configDirPath);
    if (!fs.existsSync(defaultConfigPath) && configs.length > 1) {
      console.log(
        chalk.red(
          `${icons.error} You have not defined a default config file, please do so at /configs/default.json`
        )
      );
      process.exit(1);
      return;
    }

    if (configs.length <= 0 || configs[0] === 'test.json') {
      // this case is just for libraries where testing is the only time configs are actually used.
      return;
    }
    const baseKeys = Object.keys(
      flatten(require(path.join(configDirPath, 'default.json')))
    );

    let passesTest = true;

    for (let i = 0; i < configs.length; i += 1) {
      if (configs[i] !== 'default.json') {
        const keys = Object.keys(
          flatten(require(path.join(configDirPath, configs[i])))
        );
        const extraKeys = keys.filter((key) => baseKeys.indexOf(key) === -1);
        if (extraKeys.length) {
          console.error(
            `${configs[i]} has the following extra keys; ${extraKeys.join(
              ', '
            )}`
          );
        }
        if (extraKeys.length) {
          passesTest = false;
        }
      }
    }

    if (!passesTest) {
      process.exit(1);
      return;
    }
    console.log(chalk.green(`${icons.check} Configs match up`));
  } else {
    console.log(
      chalk.yellow(`${icons.warning} There are no configs for this project`)
    );
  }
}

module.exports = {
  configCheck
};
