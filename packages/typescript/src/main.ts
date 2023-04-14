#!/usr/bin/env node
import path from 'path';

import { paths, userConfig } from '@tablecheck/frontend-utils';
import fs from 'fs-extra';

import { configureTypescript } from './configureTypescript.js';
import { generateCarbonIconsTypes } from './generateCarbonIconsTypes.js';
import { generateNodeConfigTypes } from './generateNodeConfigTypes.js';
import { generateViteEnvTypes } from './generateViteEnvTypes.js';

const defaultTypesFilePath = path.join(
  paths.systemCache,
  'defaultDefinitions.d.ts',
);
const systemDefaultDefinitionFilePath = path.join(
  paths.systemDir,
  './typescript/tsconfig/defaultDefinitions.d.ts',
);
fs.copyFileSync(systemDefaultDefinitionFilePath, defaultTypesFilePath);

async function run() {
  if (userConfig.typescript === 'manual') {
    await generateCarbonIconsTypes();
    generateNodeConfigTypes();
    generateViteEnvTypes();
  } else {
    configureTypescript({
      isBuild: false,
      definitionPaths: [
        systemDefaultDefinitionFilePath,
        await generateCarbonIconsTypes(),
        generateNodeConfigTypes(),
        generateViteEnvTypes(),
      ].filter((filePath): filePath is string => !!filePath),
    });
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
