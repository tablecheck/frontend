import * as path from 'path';

import { type Tree } from '@nx/devkit';
import * as fs from 'fs-extra';
import uniq from 'lodash/uniq';

import { getNxProjectRoot } from '../../utils/nx';
import { detectInstalledVersion } from '../../utils/packageJson';
import { outputPrettyFile } from '../../utils/prettier';
import { createTempFiles } from '../../utils/tempFiles';

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
    const relativeSourcePath = path.relative(projectRoot, projectSourceRoot);
    const generateFiles = createTempFiles({
      tree,
      projectRoot,
      cacheLocation: __dirname,
      createFiles: (templatePath) => {
        const defaultConfigJson = fs.readJsonSync(
          defaultConfigFilePath,
        ) as Record<string, unknown>;
        const devConfigJson = (
          fs.existsSync(devConfigFilePath)
            ? fs.readJSONSync(devConfigFilePath)
            : {}
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
          path.join(
            templatePath,
            relativeSourcePath,
            'definitions',
            'nodeConfig.gen.d.ts',
          ),
          fileContent,
        );
      },
    });

    generateFiles({ overwriteExisting: true });
  } catch (e) {
    console.warn(e);
  }
}

export default tsNodeConfigGenerator;
