const path = require('path');

const fs = require('fs-extra');

const paths = require('../../config/paths');

const { execa } = require('./execa');

async function lernaList(isToposort) {
  const args = ['list', '--json', '--all'];
  if (isToposort) {
    args.push('--toposort');
  }
  const lernaListExec = await execa('lerna', args, { cwd: paths.cwd });
  // lerna re-formats package files
  await execa(
    'prettier',
    ['-u', '-w', '--loglevel=warn', 'package.json', '**/package.json'],
    { cwd: paths.cwd }
  );
  if (lernaListExec.exitCode !== 0) {
    throw new Error(lernaListExec.stderr);
  }
  const packages = JSON.parse(lernaListExec.stdout);
  return packages.map(({ location }) => location);
}

function isLerna() {
  const lernaPath = path.resolve(path.join(paths.cwd, 'lerna.json'));
  return fs.existsSync(lernaPath);
}

let cachedLernaPaths;
async function getLernaPaths() {
  if (cachedLernaPaths) return cachedLernaPaths;
  if (!isLerna()) {
    cachedLernaPaths = [];
  } else {
    cachedLernaPaths = await lernaList(false);
  }
  return cachedLernaPaths;
}

let cachedSortedLernaPaths;
async function getSortedLernaPaths() {
  if (cachedSortedLernaPaths) return cachedSortedLernaPaths;
  if (!isLerna()) {
    cachedSortedLernaPaths = [];
  } else {
    cachedSortedLernaPaths = await lernaList(true);
  }
  return cachedSortedLernaPaths;
}

module.exports = {
  isLerna,
  getLernaPaths,
  getSortedLernaPaths
};
