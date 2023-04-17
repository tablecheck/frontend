const path = require('path');

const fs = require('fs-extra');
const { glob } = require('glob');

(async () => {
  const matchedFiles = glob
    .sync('**/*.md', {
      silent: true,
    })
    .filter((p) => p.indexOf('node_modules') === -1)
    .filter((p) => p.indexOf('CHANGELOG') === -1);
  matchedFiles.forEach((file) => {
    const pathParts = path.parse(file);
    const newFile = path.join(
      process.cwd(),
      pathParts.dir,
      `${pathParts.name}.stories.mdx`,
    );
    const mdFile = fs.readFileSync(path.join(process.cwd(), file));
    const titleFolder = pathParts.dir.replace(/packages\/|src\//gi, '');
    const titleName = pathParts.name.replace(/README/gi, 'Introduction');
    const title = [titleFolder, titleName].filter((p) => !!p).join('/');
    fs.writeFileSync(
      newFile,
      `import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="${title}" />

## ${titleName}

${mdFile}`,
      'utf8',
    );
    if (pathParts.name !== 'README')
      fs.unlinkSync(path.join(process.cwd(), file));
  });
  process.exit(0);
})();
