import * as path from 'path';

import { Tree } from '@nx/devkit';
import {
  detectInstalledVersion,
  outputPrettyFile,
  getNxProjectRoot,
} from '@tablecheck/frontend-utils';
import * as fs from 'fs-extra';
// eslint-disable-next-line @tablecheck/forbidden-imports
import { uniq } from 'lodash';

function buildTypes(configValue: unknown): string {
  if (Array.isArray(configValue))
    return `(${uniq(configValue.map((v) => buildTypes(v))).join(' | ')})[]`;
  switch (typeof configValue) {
    case 'object': {
      if (Array.isArray(configValue))
        return `readonly (${uniq(configValue.map((v) => buildTypes(v))).join(
          ' | ',
        )})[]`;
      return `{${Object.keys(configValue as Record<string, unknown>)
        .map(
          (key) =>
            `readonly ${key}: ${buildTypes(
              (configValue as Record<string, unknown>)[key],
            )};`,
        )
        .join('\n')}}`;
    }
    case 'bigint':
      return 'number';
    default:
      return typeof configValue;
  }
}

function getConfigBasePath(root: string, projectRoot: string) {
  const projectConfigPath = path.join(projectRoot, 'config');
  if (fs.existsSync(projectConfigPath)) {
    return projectConfigPath;
  }
  const rootConfigPath = path.join(root, 'config');
  if (fs.existsSync(rootConfigPath)) {
    return rootConfigPath;
  }
  throw new Error(
    `No config directory found at ${projectConfigPath} or ${rootConfigPath} for project ${projectRoot}`,
  );
}

export function tsNodeConfigGenerator(tree: Tree, schema: { project: string }) {
  const { projectRoot, projectSourceRoot } = getNxProjectRoot(
    tree,
    schema.project,
  );
  try {
    try {
      detectInstalledVersion(projectRoot, 'config', '*');
    } catch (e) {
      detectInstalledVersion(tree.root, 'config', '*');
    }

    const configBasePath = getConfigBasePath(tree.root, projectRoot);
    const defaultConfigFilePath = path.join(configBasePath, 'default.json');
    const devConfigFilePath = path.join(configBasePath, 'development.json');
    if (!fs.existsSync(defaultConfigFilePath)) {
      console.info('No default config found, skipping config generation');
      return;
    }

    const defaultConfigJson = fs.readJsonSync(defaultConfigFilePath) as Record<
      string,
      unknown
    >;
    const devConfigJson = (
      fs.existsSync(devConfigFilePath) ? fs.readJSONSync(devConfigFilePath) : {}
    ) as Record<string, unknown>;
    const fileContent = `declare module 'config' {
        // this file is generated with \`nx generate @tablecheck/nx:ts-node-config ${
          schema.project
        }\`
        interface DefaultConfig ${buildTypes(defaultConfigJson)}
        export interface DevelopmentConfig extends DefaultConfig ${buildTypes(
          devConfigJson,
        )}
      
        global {
          const CONFIG: DevelopmentConfig;
        }
        const config: DevelopmentConfig;
        export default config;
      }`;
    outputPrettyFile(
      path.join(projectSourceRoot, 'definitions', 'nodeConfig.gen.d.ts'),
      fileContent,
    );
  } catch (e) {
    console.warn(e);
  }
}

export default tsNodeConfigGenerator;
