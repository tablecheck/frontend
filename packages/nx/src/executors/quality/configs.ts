import * as path from 'path';

import chalk from 'chalk';
import { flatten } from 'flat';
import * as fs from 'fs-extra';

import { unicodeEmoji as icons } from '../../utils/unicodeEmoji';

export function configCheck(cwd: string) {
  const configDirPath = path.join(cwd, 'config');
  if (!fs.existsSync(configDirPath)) {
    console.log(
      chalk.yellow(`${icons.warning} There are no configs for this project`),
    );
    return;
  }
  const defaultConfigPath = path.join(configDirPath, 'default.json');
  const configs = fs.readdirSync(configDirPath);
  if (!fs.existsSync(defaultConfigPath) && configs.length > 1) {
    console.log(
      chalk.red(
        `${icons.error} You have not defined a default config file, please do so at /configs/default.json`,
      ),
    );
    throw new Error('No default config file');
  }

  if (configs.length <= 0 || configs[0] === 'test.json') {
    // this case is just for libraries where testing is the only time configs are actually used.
    return;
  }
  const baseKeys = Object.keys(
    flatten(
      fs.readJSONSync(path.join(configDirPath, 'default.json')) as Record<
        string,
        unknown
      >,
    ),
  );

  let didPassTest = true;

  for (const config of configs) {
    if (config !== 'default.json') {
      const keys = Object.keys(
        flatten(fs.readJSONSync(path.join(configDirPath, config))),
      );
      const extraKeys = keys.filter((key) => baseKeys.indexOf(key) === -1);
      if (extraKeys.length) {
        console.error(
          `${config} has the following extra keys; ${extraKeys.join(', ')}`,
        );
      }
      if (extraKeys.length) {
        didPassTest = false;
      }
    }
  }

  if (!didPassTest) {
    throw new Error('Config check failed');
  }
  console.log(chalk.green(`${icons.check} Configs match up`));
}
