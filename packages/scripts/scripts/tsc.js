// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'lib';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  console.error(err);
  throw new Error();
});

const { getArgv } = require('./utils/argv');
const {
  configureLibTypescript,
  configureAppTypescript
} = require('./utils/configureTypescript');
const { execa, execaOptions } = require('./utils/execa');
const { isLerna } = require('./utils/lerna');
const { logTaskEnd, logTaskStart } = require('./utils/taskLogFormatter');
const verifyPackageTree = require('./utils/verifyPackageTree');

if (process.env.SKIP_PREFLIGHT_CHECK !== 'true') {
  verifyPackageTree();
}

(async () => {
  logTaskStart('Configuring typescript');

  const { _args: args } = getArgv(
    {
      boolean: ['build', 'project', 'noEmit'],
      default: {
        build: false
      }
    },
    true
  );

  args.unshift('--build');

  if (isLerna()) {
    await configureLibTypescript(true, true);
  } else {
    await configureAppTypescript(true, true);
  }
  logTaskEnd(true);

  let exitStatus = 0;
  try {
    await execa('tsc', args, execaOptions);
  } catch (error) {
    exitStatus = 1;
  }
  if (isLerna()) {
    await configureLibTypescript(true, true, true);
  }
  process.exit(exitStatus);
})();
