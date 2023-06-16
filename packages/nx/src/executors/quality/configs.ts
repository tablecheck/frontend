import * as path from 'path';

import { unicodeEmoji as icons } from '@tablecheck/frontend-utils';
import * as chalk from 'chalk';
import { flatten } from 'flat';
import * as fs from 'fs-extra';

export function configCheck(cwd: string): void {
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

  for (let i = 0; i < configs.length; i += 1) {
    if (configs[i] !== 'default.json') {
      const keys = Object.keys(
        flatten(fs.readJSONSync(path.join(configDirPath, configs[i]))),
      );
      const extraKeys = keys.filter((key) => baseKeys.indexOf(key) === -1);
      if (extraKeys.length) {
        console.error(
          `${configs[i]} has the following extra keys; ${extraKeys.join(', ')}`,
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
