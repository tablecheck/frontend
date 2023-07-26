import * as path from 'path';

import {
  Tree,
  updateJson,
  installPackagesTask,
  addDependenciesToPackageJson,
} from '@nx/devkit';
import * as fs from 'fs-extra';
import { PackageJson } from 'type-fest';

import generateQuality from '../../generators/quality/generator';
import { getLatestVersions } from '../../utils/dependencies';

export default async function update(tree: Tree) {
  const src = path.join(__dirname, 'files', 'pre-commit');
  const dest = path.join(tree.root, '.husky', 'pre-commit');
  const oldFile = fs.readFileSync(dest, 'utf-8');
  const newFile = fs.readFileSync(src, 'utf-8');
  console.log(`Updated ${dest}`);
  if (oldFile !== newFile) {
    console.log(`  - old file backed up to ${dest}.old`);
    fs.writeFileSync(`${dest}.old`, oldFile);
  }
  fs.copyFileSync(src, dest);

  console.log('Updating dependencies');

  let projectName = '.';

  updateJson(tree, 'package.json', (json: PackageJson) => {
    projectName = json.name || '.';
    for (const deps of [json.dependencies, json.devDependencies]) {
      if (deps) {
        delete deps['@tablecheck/babel-preset'];
        delete deps['@tablecheck/eslint-config'];
        delete deps['@tablecheck/eslint-plugin'];
        delete deps['@tablecheck/scripts'];
        delete deps['babel-preset-razzle'];
        delete deps.razzle;
        delete deps['razzle-dev-utils'];
      }
    }
    if (!json.scripts) json.scripts = {};

    json.scripts['generate:carbon-icons'] =
      'nx generate @tablecheck/nx:ts-carbon-icons';
    json.scripts['generate:node-config'] =
      'nx generate @tablecheck/nx:ts-node-config';

    return json;
  });

  installPackagesTask(tree);

  await addDependenciesToPackageJson(
    tree,
    {},
    getLatestVersions(['@tablecheck/audit', '@tablecheck/nx']),
  )();

  await generateQuality(tree, { svgAsComponent: true, project: projectName });
}
