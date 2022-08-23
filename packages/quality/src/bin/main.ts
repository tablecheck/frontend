#!/usr/bin/env node
// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

import { getArgv } from '@tablecheck/scripts-utils';
import { lint } from '../lint.js';
import { precommit } from '../precommit.js';
import { setup } from '../setup.js';

const argv = getArgv({
  boolean: ['precommit', 'setup'],
  default: {
    precommit: false,
    setup: false
  }
});

if (argv.setup) await setup();
else if (argv.precommit) await precommit();
else await lint();
