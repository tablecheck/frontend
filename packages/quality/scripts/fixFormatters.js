import path from 'path';

import fs from 'fs-extra';

const formatters = ['./eslintStylishFormatter.ts', './eslintJunitFormatter.ts'];

fs.outputFileSync(
  path.join(process.cwd(), 'lib/formatters/package.json'),
  JSON.stringify({
    type: 'commonjs'
  })
);

// eslint style loaders do NOT support ES6 so we need to do some "special work"
formatters.forEach((formatter) => {
  const correctPath = path.join(process.cwd(), 'lib/formatters', formatter);
  fs.renameSync(`${correctPath}.cjs`, correctPath);
  fs.removeSync(`${correctPath}.mjs`);
});
