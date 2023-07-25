import path from 'path';
import { fileURLToPath } from 'url';

import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generatorsPath = path.join(__dirname, '../src/generators');
const generators = fs.readdirSync(generatorsPath);

generators.forEach((generator) => {
  const generatorPath = path.join(generatorsPath, generator);
  if (fs.statSync(generatorPath).isDirectory()) {
    const filesPath = path.join(generatorPath, 'files');
    if (fs.existsSync(filesPath)) {
      const distFilesPath = path.join(
        __dirname,
        '../dist/generators',
        generator,
        'files',
      );
      fs.ensureDirSync(distFilesPath);
      fs.copySync(filesPath, distFilesPath);
    }
  }
});
