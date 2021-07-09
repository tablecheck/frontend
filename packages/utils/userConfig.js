const path = require('path');

const { cosmiconfigSync } = require('cosmiconfig');

const explorer = cosmiconfigSync('@tablecheck');
// TODO this is currently only used in jest and test setup - see if we can eliminate it entirely
const args = process.argv.slice(2);
let configOption;
for (let i = 0; i < args.length; i += 1) {
  if (args[i].indexOf('--scriptConfig=') === 0) {
    configOption = args[i].substr(args[i].indexOf('=') + 1);
    break;
  }
}

if (configOption) {
  try {
    module.exports = require(path.resolve(process.cwd(), configOption));
  } catch (err) {
    throw new Error(`Invalid --config file path "${configOption}"`);
  }
} else {
  module.exports = (explorer.search() || { config: {} }).config;
}
