import path from 'path';

import fs from 'fs-extra';

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const currentWorkingDirectory =
  process.env.INIT_CWD || fs.realpathSync(process.cwd());
const resolveApp = (relativePath: string) =>
  path.resolve(currentWorkingDirectory, relativePath);
// in this repo postinstall the env var is undefined
const systemDir = (process.env._ || '').match(
  // this check is for any scripts running from the tablecheck-frontend package.json which are absolutely referenced
  // all other cases should be running via NPM and in node_modules
  /^packages\/(quality|audit)\/bin\/main\.js/gi
)
  ? path.join(currentWorkingDirectory, 'packages')
  : path.join(currentWorkingDirectory, 'node_modules/@tablecheck');

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
