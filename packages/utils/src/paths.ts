import path from 'path';

import fs from 'fs-extra';

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const currentWorkingDirectory =
  process.env.INIT_CWD || fs.realpathSync(process.cwd());
const resolveApp = (relativePath: string) =>
  path.resolve(currentWorkingDirectory, relativePath);
// in this repo postinstall the env var is undefined
const execLocation = process.env._ || './bin/postinstall.js';
let systemDir = execLocation;
const appRelativeSystemDir = path.join(
  currentWorkingDirectory,
  'node_modules/@tablecheck/scripts'
);
if (fs.existsSync(appRelativeSystemDir)) systemDir = appRelativeSystemDir;
// check for running itself - in npm postinstall or precommit hook here
else if (execLocation === './bin/postinstall.js') systemDir = '.';
else if (execLocation === './packages/scripts/bin/scripts.js')
  systemDir = path.join(process.cwd(), './packages/scripts');
else systemDir = path.join(execLocation, '../../@tablecheck/scripts');

const testFilePath = './tsconfig/defaultDefinitions.d.ts';
if (!fs.existsSync(path.join(systemDir, testFilePath))) {
  let currentTestDirectory = currentWorkingDirectory;
  systemDir = path.join(
    currentWorkingDirectory,
    'node_modules/@tablecheck/scripts'
  );
  while (
    systemDir &&
    systemDir !== '/' &&
    !fs.existsSync(path.join(systemDir, testFilePath))
  ) {
    currentTestDirectory = path.join(currentTestDirectory, '..');
    systemDir = path.join(
      currentTestDirectory,
      'node_modules/@tablecheck/scripts'
    );
  }
  if (!systemDir || systemDir === '/')
    throw new Error(
      `Could not find system directory from process.cwd() "${process.cwd()}" or execLocation "${execLocation}" or INIT_CWD "${
        process.env.INIT_CWD
      }"`
    );
}

// config after eject: we're in ./config/
export const paths = {
  cwd: currentWorkingDirectory,
  systemDir,
  systemCache: resolveApp('.@tablecheck'),
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

// Here we setup the systemCache and add it to .gitignore if not already added
if (!fs.existsSync(paths.systemCache)) {
  fs.mkdirSync(paths.systemCache);
}
const gitignorePath = path.join(paths.cwd, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const content = fs.readFileSync(gitignorePath, 'utf8').split('\n');
  if (!content.find((pattern) => pattern === paths.systemCache)) {
    if (content[content.length]) {
      content.push(paths.systemCache);
    } else {
      content.splice(content.length - 1, 0, paths.systemCache);
    }
  }
  fs.writeFileSync(gitignorePath, content.join('\n'), 'utf8');
}
