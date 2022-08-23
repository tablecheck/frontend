#!/usr/bin/env node
// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

import { getArgv } from '@tablecheck/scripts-utils';
import { precommit } from '../precommit.js';

try {
  await precommit();
  process.exit(0);
} catch (e) {
  if (getArgv().verbose) console.error(e);
  process.exit(1);
}
