const path = require('path');

const fs = require('fs-extra');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = process.env.INIT_CWD || fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
// in this repo postinstall the env var is undefined
const execLocation = process.env._ || './bin/postinstall.js';
let systemDir = execLocation;
const appRelativeSystemDir = path.join(
  appDirectory,
  'node_modules/@tablecheck/scripts'
);
if (fs.existsSync(appRelativeSystemDir)) systemDir = appRelativeSystemDir;
// check for running itself - in npm postinstall or precommit hook here
else if (execLocation === './bin/postinstall.js') systemDir = '.';
else if (execLocation === './packages/scripts/bin/scripts.js')
  systemDir = path.join(process.cwd(), './packages/scripts');
else systemDir = path.join(execLocation, '../../@tablecheck/scripts');

// config after eject: we're in ./config/
module.exports = {
  cwd: appDirectory,
  systemDir,
  appBuild: resolveApp('build'),
  libBuild: resolveApp('lib'),
  appPublic: resolveApp('public'),
  appIndexJs: resolveApp('src/index.tsx'),
  ssrIndexJs: resolveApp('src/server.tsx'),
  libIndexJs: resolveApp('src/index.ts'),
  appPackageJson: resolveApp('package.json'),
  appJestConfig: resolveApp('jest.config.js'),
  appSrc: resolveApp('src'),
  cypress: resolveApp('cypress'),
  storybook: resolveApp('.storybook'),
  appNodeModules: resolveApp('node_modules')
};
