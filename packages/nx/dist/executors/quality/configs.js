"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configCheck = void 0;
const path = require("path");
const chalk = require("chalk");
const flat_1 = require("flat");
const fs = require("fs-extra");
async function configCheck(cwd) {
    const { unicodeEmoji: icons } = await import('@tablecheck/frontend-utils');
    const configDirPath = path.join(cwd, 'config');
    if (!fs.existsSync(configDirPath)) {
        console.log(chalk.yellow(`${icons.warning} There are no configs for this project`));
        return;
    }
    const defaultConfigPath = path.join(configDirPath, 'default.json');
    const configs = fs.readdirSync(configDirPath);
    if (!fs.existsSync(defaultConfigPath) && configs.length > 1) {
        console.log(chalk.red(`${icons.error} You have not defined a default config file, please do so at /configs/default.json`));
        throw new Error('No default config file');
    }
    if (configs.length <= 0 || configs[0] === 'test.json') {
        // this case is just for libraries where testing is the only time configs are actually used.
        return;
    }
    const baseKeys = Object.keys((0, flat_1.flatten)(fs.readJSONSync(path.join(configDirPath, 'default.json'))));
    let didPassTest = true;
    for (let i = 0; i < configs.length; i += 1) {
        if (configs[i] !== 'default.json') {
            const keys = Object.keys((0, flat_1.flatten)(fs.readJSONSync(path.join(configDirPath, configs[i]))));
            const extraKeys = keys.filter((key) => baseKeys.indexOf(key) === -1);
            if (extraKeys.length) {
                console.error(`${configs[i]} has the following extra keys; ${extraKeys.join(', ')}`);
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
exports.configCheck = configCheck;
//# sourceMappingURL=configs.js.map