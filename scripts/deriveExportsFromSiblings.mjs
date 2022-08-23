import path from 'path';
import fs from 'fs-extra';

const sourceDir = path.join(process.cwd(), 'src');
const indexPath = path.join(sourceDir, 'index.ts');
if (!fs.existsSync(sourceDir) || !fs.existsSync(indexPath)) process.exit(0);
else {
  const files = fs
    .readdirSync(sourceDir, { withFileTypes: true })
    .filter(
      (dirrent) =>
        dirrent.isFile &&
        dirrent.name.match(/^[a-z0-9]+\.ts$/gi) &&
        !dirrent.name.match(/^index\.ts$/gi)
    );
  fs.outputFileSync(
    indexPath,
    `// Auto Generated file from <root>/scripts/deriveExportsFromSiblings.mjs - Do Not Edit
${files
  .map(
    (dirrent) => `export * from './${dirrent.name.replace(/\.ts$/gi, '.js')}'`
  )
  .join('\n')}`
  );
}
