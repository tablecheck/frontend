// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

const { getArgv } = require('./utils/argv');
const { lintAllPackages, format: formatPackages } = require('./utils/package');

const argv = getArgv({
  boolean: ['write'],
  default: {
    write: false
  }
});

(async () => {
  try {
    if (argv.write) {
      await formatPackages();
    } else {
      await lintAllPackages();
    }
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
})();
