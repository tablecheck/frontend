#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const fs = require('fs');
const path = require('path');

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  console.error(err);
  throw new Error();
});

const execa = require('execa');

const args = process.argv.slice(2);
const scriptFiles = fs.readdirSync(
  path.resolve(path.join(__dirname, '../scripts'))
);
const scripts = scriptFiles.reduce((validScripts, filename) => {
  const match = /(.+)\.js$/.exec(filename);
  if (match) {
    validScripts.push(match[1]);
  }
  return validScripts;
}, []);

const scriptIndex = args.findIndex((x) => scripts.indexOf(x) >= 0);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

if (scripts.indexOf(script) === -1) {
  console.log(`Unknown script "${script}".`);
  process.exit(1);
}
try {
  const result = execa.sync(
    'node',
    nodeArgs
      .concat(require.resolve(`../scripts/${script}`))
      .concat(args.slice(scriptIndex + 1)),
    {
      stdin: 'inherit',
      stdout: 'inherit',
      stderr: 'inherit'
    }
  );
  process.exit(result.exitCode === undefined ? 1 : result.exitCode);
} catch (error) {
  if (error.signal) {
    if (error.signal === 'SIGKILL') {
      console.log(
        'The build failed because the process exited too early. ' +
          'This probably means the system ran out of memory or someone called ' +
          '`kill -9` on the process.'
      );
    } else if (error.signal === 'SIGTERM') {
      console.log(
        'The build failed because the process exited too early. ' +
          'Someone might have called `kill` or `killall`, or the system could ' +
          'be shutting down.'
      );
    }
    process.exit(1);
  }
  process.exit(error.exitCode === undefined ? 1 : error.exitCode);
}
