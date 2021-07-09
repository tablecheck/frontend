#!/usr/bin/env node
const path = require('path');

const fs = require('fs-extra');

const {
  configureLibTypescript,
  configureAppTypescript
} = require('../scripts/utils/configureTypescript');

// postinstall is weird https://github.com/npm/npm/issues/16990
const projectDir = process.env.INIT_CWD;
// don't do the install on npx, that's just bad if they aren't ready for it...
const isNpx = process.argv.find((argPath) => argPath.match(/\/_npx\//));

if (!isNpx) {
  if (
    fs.existsSync(path.join(projectDir, 'lerna.json')) ||
    fs.existsSync(path.join(projectDir, 'lib'))
  ) {
    configureLibTypescript(false, false);
  } else {
    configureAppTypescript(false);
  }
}
