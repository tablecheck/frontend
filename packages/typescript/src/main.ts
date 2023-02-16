#!/usr/bin/env node
import path from 'path';

import { paths } from '@tablecheck/frontend-utils';
import fs from 'fs-extra';

import { configureTypescript } from './configureTypescript.js';
import { generateCarbonIconsTypes } from './generateCarbonIconsTypes.js';
import { generateNodeConfigTypes } from './generateNodeConfigTypes.js';
import { generateViteEnvTypes } from './generateViteEnvTypes.js';

const defaultTypesFilePath = path.join(
  paths.systemCache,
  'defaultDefinitions.d.ts'
);
const systemDefaultDefinitionFilePath = path.join(
  paths.systemDir,
  './typescript/tsconfig/defaultDefinitions.d.ts'
);
fs.copyFileSync(systemDefaultDefinitionFilePath, defaultTypesFilePath);

configureTypescript({
  isBuild: false,
  definitionPaths: [
    systemDefaultDefinitionFilePath,
    await generateCarbonIconsTypes(),
    generateNodeConfigTypes(),
    generateViteEnvTypes()
  ].filter((filePath): filePath is string => !!filePath)
});
