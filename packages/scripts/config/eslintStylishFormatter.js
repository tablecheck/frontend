const fs = require('fs');
const path = require('path');

const stylishFormatter = require('eslint/lib/cli-engine/formatters/stylish');

const paths = require('./paths');

function comparePaths(pathA, pathB) {
  const aIsDir = fs.statSync(pathA).isDirectory();
  const bIsDir = fs.statSync(pathB).isDirectory();

  if (aIsDir && !bIsDir) {
    return -1;
  }

  if (!aIsDir && bIsDir) {
    return 1;
  }

  return pathA.localeCompare(pathB);
}

module.exports = function customStylish(results) {
  return stylishFormatter(
    results
      // sorts by output by folder first, then files
      // this should roughly mimic most IDE and file browser displays
      .sort(({ filePath: a }, { filePath: b }) => {
        const aParts = a.split('/');
        const bParts = b.split('/');
        for (let i = 0; i < aParts.length && i < bParts.length; i += 1) {
          if (aParts[i] !== bParts[i]) {
            return comparePaths(
              aParts.slice(0, i + 1).join('/'),
              bParts.slice(0, i + 1).join('/')
            );
          }
        }
        return comparePaths(a, b);
      })
      .map((result) => ({
        ...result,
        // makes the path relative to cwd instead of absolute
        filePath: path.relative(paths.cwd, result.filePath)
      }))
  );
};
