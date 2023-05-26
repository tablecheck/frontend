import { formatFiles, readProjectConfiguration, Tree } from '@nx/devkit';
import * as path from 'path';
import * as fs from 'fs-extra';
import { uniq } from 'lodash';
import { detectInstalledVersion } from '@tablecheck/frontend-utils';
import { TsNodeConfigGeneratorSchema } from './schema';

function buildTypes(configValue: unknown): string {
  if (Array.isArray(configValue))
    return `(${uniq(configValue.map((v, i) => buildTypes(v))).join(' | ')})[]`;
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

export async function tsNodeConfigGenerator(
  tree: Tree,
  options: TsNodeConfigGeneratorSchema,
) {
  const projectRoot = readProjectConfiguration(tree, options.project).root;
  try {
    detectInstalledVersion(projectRoot, 'config', '*');

    const defaultConfigFilePath = path.join(projectRoot, 'config/default.json');
    const devConfigFilePath = path.join(projectRoot, 'config/development.json');
    if (!fs.existsSync(defaultConfigFilePath)) return;

    const defaultConfigJson = fs.readJsonSync(defaultConfigFilePath);
    const devConfigJson = fs.existsSync(devConfigFilePath)
      ? fs.readJSONSync(devConfigFilePath)
      : {};
    const fileContent = `declare module '@tablecheck/scripts' {
        // this file is autobuilt inside configureTypescript, all changes here will be overwritten
        interface DefaultConfig ${buildTypes(defaultConfigJson)}
        export interface Config extends DefaultConfig ${buildTypes(
          devConfigJson,
        )}
      
        global {
          const CONFIG: Config;
        }
      }`;
    fs.outputFileSync(
      path.join(projectRoot, 'src', 'definitions', 'nodeConfig.d.ts'),
      fileContent,
    );
    await formatFiles(tree);
  } catch (e) {
    console.warn(e);
  }
}

export default tsNodeConfigGenerator;
