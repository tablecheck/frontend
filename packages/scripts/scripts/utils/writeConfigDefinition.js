const path = require('path');

const chalk = require('chalk');
const fs = require('fs-extra');
const jscodeshift = require('jscodeshift');
const getCodeshiftParser = require('jscodeshift/src/getParser');
const minimist = require('minimist');
const prettier = require('prettier');

const paths = require('../../config/paths');

const { logTaskEnd, logTaskStart } = require('./taskLogFormatter');

const argv = minimist(process.argv.slice(2), {
  boolean: ['verbose'],
  default: {
    verbose: false
  }
});

const systemCacheFolderName = '.@tablecheck';
const systemCacheFolderPath = path.join(paths.cwd, systemCacheFolderName);

const systemDefinitionFilePath = path.join(
  systemCacheFolderPath,
  'definitions.d.ts'
);
const systemDefaultDefinitionFilePath = path.join(
  paths.cwd,
  './node_modules/@tablecheck/scripts/tsconfig/defaultDefinitions.d.ts'
);

function getTypeAnnotation(j, value) {
  let type = j.tsUnknownKeyword();
  switch (typeof value) {
    case 'string':
      type = j.tsStringKeyword();
      break;
    case 'boolean':
      type = j.tsBooleanKeyword();
      break;
    case 'number':
    case 'bigint':
      type = j.tsNumberKeyword();
      break;
    case 'object':
      if (Array.isArray(value)) {
        const primitiveTypes = [];
        const complexTypes = [];
        value.forEach((element) => {
          const arrayElementType = typeof element;
          if (arrayElementType === 'object') {
            complexTypes.push(getTypeAnnotation(j, element).typeAnnotation);
          } else if (primitiveTypes.indexOf(arrayElementType) === -1) {
            primitiveTypes.push(arrayElementType);
          }
        }, []);
        const arrayTypes = primitiveTypes
          .map((primitive) => {
            switch (primitive) {
              case 'string':
                return j.tsStringKeyword();
              case 'boolean':
                return j.tsBooleanKeyword();
              case 'number':
              case 'bigint':
                return j.tsNumberKeyword();
              default:
                return j.tsUnknownKeyword();
            }
          })
          .concat(complexTypes);
        if (arrayTypes.length === 0) {
          type = j.tsTupleType([]);
        } else if (arrayTypes.length === 1) {
          type = j.tsArrayType(arrayTypes[0]);
        } else {
          type = j.tsArrayType(
            j.tsParenthesizedType(j.tsUnionType(arrayTypes))
          );
        }
      } else {
        type = j.tsTypeLiteral(
          Object.keys(value).map((subKey) =>
            // eslint-disable-next-line no-use-before-define
            buildPropertySignature(j, subKey, value[subKey])
          )
        );
      }
      break;
    default:
  }
  return j.tsTypeAnnotation(type);
}

function buildPropertySignature(j, key, value) {
  if (key.match(/^[^a-z]|[^a-z0-9]/gi)) {
    const property = j.tsPropertySignature(
      j.stringLiteral(key),
      getTypeAnnotation(j, value)
    );
    property.computed = true;
    return property;
  }
  return j.tsPropertySignature(j.identifier(key), getTypeAnnotation(j, value));
}

function buildTypes(j, json) {
  return Object.keys(json).map((key) =>
    buildPropertySignature(j, key, json[key])
  );
}

/**
 * This function means we never have to manually write CONFIG definitions files :tada:
 * They just get pre-compiled from the actual config folder :D
 */
function writeConfigDefinition() {
  logTaskStart('Generating definition file for node-config');

  if (!fs.existsSync(systemCacheFolderPath)) {
    fs.mkdirSync(systemCacheFolderPath);
    const gitignorePath = path.join(paths.cwd, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf8').split('\n');
      if (!content.find((pattern) => pattern === systemCacheFolderName)) {
        if (content[content.length]) {
          content.push(systemCacheFolderName);
        } else {
          content.splice(content.length - 1, 0, systemCacheFolderName);
        }
      }
      fs.writeFileSync(gitignorePath, content.join('\n'), 'utf8');
    }
  }

  const defaultConfigFilePath = path.join(paths.cwd, 'config/default.json');
  if (!fs.existsSync(defaultConfigFilePath)) {
    fs.copyFileSync(systemDefaultDefinitionFilePath, systemDefinitionFilePath);
  } else {
    const configJson = fs.readJsonSync(defaultConfigFilePath);
    const defaultFile = fs.readFileSync(
      systemDefaultDefinitionFilePath,
      'utf8'
    );
    const j = jscodeshift.withParser(getCodeshiftParser('ts', {}));
    const root = j(defaultFile);
    root
      .find(j.TSInterfaceDeclaration, { id: { name: 'Config' } })
      .at(0)
      .forEach((nodePath) => {
        nodePath.node.body.body = buildTypes(j, configJson);
      });

    const prettierOptions = prettier.resolveConfig.sync(paths.cwd);
    fs.writeFileSync(
      systemDefinitionFilePath,
      prettier.format(root.toSource(), {
        ...prettierOptions,
        filepath: systemDefinitionFilePath
      })
    );
  }
  logTaskEnd(true);
  if (argv.verbose) {
    console.log('');
    console.log(chalk.gray(path.relative(paths.cwd, systemDefinitionFilePath)));
    console.log(chalk.gray(fs.readFileSync(systemDefinitionFilePath, 'utf8')));
  }
}

module.exports = { writeConfigDefinition, systemDefinitionFilePath };
