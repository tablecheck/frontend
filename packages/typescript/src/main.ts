#!/usr/bin/env node
import path from 'path';

import { paths } from '@tablecheck/scripts-utils';
import fs from 'fs-extra';

import { configureTypescript } from './configureTypescript.js';
import { generateCarbonIconsTypes } from './generateCarbonIconsTypes.js';
import { generateNodeConfigTypes } from './generateNodeConfigTypes.js';
import { generateViteEnvTypes } from './generateViteEnvTypes.js';

const nodeConfigTypesFilePath = path.join(paths.systemCache, 'nodeConfig.d.ts');
const systemDefaultDefinitionFilePath = path.join(
  paths.systemDir,
  './tsconfig/defaultDefinitions.d.ts'
);
fs.copyFileSync(systemDefaultDefinitionFilePath, nodeConfigTypesFilePath);

configureTypescript({
  isBuild: false,
  definitionPaths: [
    systemDefaultDefinitionFilePath,
    generateCarbonIconsTypes(),
    generateNodeConfigTypes(),
    generateViteEnvTypes()
  ].filter((filePath): filePath is string => !!filePath)
});
