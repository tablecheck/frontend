const path = require('path');

const fs = require('fs-extra');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = process.env.INIT_CWD || fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

// config after eject: we're in ./config/
module.exports = {
  cwd: appDirectory,
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
