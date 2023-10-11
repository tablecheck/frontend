#!/usr/bin/env node
import minimist from 'minimist';

import { run } from './index.js';

const argv = minimist(process.argv.slice(2), {
  boolean: ['ci'],
  default: {
    ci: false,
  },
});

run({ rootPath: process.cwd(), updatePrompts: !argv.ci })
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
