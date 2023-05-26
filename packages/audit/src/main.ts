#!/usr/bin/env node
import { getArgv } from '@tablecheck/frontend-utils';
import { run } from './index';

const argv = getArgv({
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
