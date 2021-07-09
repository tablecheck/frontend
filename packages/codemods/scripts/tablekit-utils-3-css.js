const getIdentifierUsages = require('../utils/getIdentifierUsages');
const mergeImports = require('../utils/mergeImports');
const removeUselessTemplateExpressions = require('../utils/removeUselessTemplateExpressions');

function getArguments(callArgs) {
  if (callArgs.type === 'Identifier') {
    return {
      argMap: undefined,
      restOrIdent: callArgs.name,
      isAllSet: true
    };
  }
  let restOrIdent;
  const argMap = callArgs.properties.reduce((result, property) => {
    if (property.type === 'ObjectProperty') {
      return { ...result, [property.key.name]: property.value.name };
    }
    if (property.type === 'RestElement' || property.type === 'SpreadElement') {
      restOrIdent = property.argument.name;
    }
    return result;
  }, {});
  return {
    argMap,
    restOrIdent,
    isAllSet:
      Object.keys(argMap).length ===
      (restOrIdent
        ? callArgs.properties.length - 1
        : callArgs.properties.length)
  };
}

module.exports = function tablekitUtils3CssTransform(file, api) {
  const j = api.jscodeshift;

  const root = j(file.source);

  const utilsImport = root.find(j.ImportDeclaration, {
    source: {
      type: 'StringLiteral',
      value: '@tablekit/utils'
    }
  });

  if (utilsImport.size() === 0) {
    return file.source;
  }

  const utilsCssImports = [];
  utilsImport
    .find(j.Specifier, { imported: { name: 'css' } })
    .forEach((path) => {
      utilsCssImports.push(path.node.local.name);
      j(path).remove();
    });

  const emotionCssImports = [];
  const emotionCssSpecifier = root.find(j.Specifier, {
    imported: { name: 'css' }
  });

  if (emotionCssSpecifier.size()) {
    emotionCssSpecifier.forEach((path) => {
      emotionCssImports.push(path.get('local').value.name);
    });
    emotionCssSpecifier.remove();
  }

  const emotionCssImport = root.find(j.ImportDeclaration, {
    source: {
      type: 'StringLiteral',
      value: '@emotion/react'
    }
  });
  const emotionReactImport = root.find(j.ImportDeclaration, {
    source: {
      type: 'StringLiteral',
      value: '@emotion/css'
    }
  });

  let importName = 'css';
  if (
    !emotionCssImports.find((s) => s === 'css') &&
    !utilsCssImports.find((s) => s === 'css')
  ) {
    importName = emotionCssImports[0] || utilsCssImports[0];
  }
  const newImport = j.importSpecifier(
    j.identifier('css'),
    j.identifier(importName || 'css')
  );
  if (emotionReactImport.size()) {
    emotionReactImport.at(0).get('specifiers').push(newImport);
  } else if (emotionCssImport.size()) {
    emotionCssImport.at(0).get('specifiers').push(newImport);
  } else {
    const newImportDeclaration = j.importDeclaration(
      [newImport],
      j.stringLiteral('@emotion/react'),
      'value'
    );
    root.find(j.ImportDeclaration).at(-1).insertAfter(newImportDeclaration);
  }

  emotionCssImports.forEach((cssVariableIdentifier) => {
    getIdentifierUsages(root, api, cssVariableIdentifier).forEach((path) => {
      if (path.parent.node.type !== 'TaggedTemplateExpression') return;
      j(path).replaceWith(j.identifier(importName));
    });
  });

  utilsCssImports.forEach((cssVariableIdentifier) => {
    getIdentifierUsages(root, api, cssVariableIdentifier).forEach((path) => {
      j(path).replaceWith(j.identifier(importName));
      if (path.parent.node.type !== 'TaggedTemplateExpression') return;
      const template = j(path.parent);
      const { expressions } = path.parent.node.quasi;
      if (!expressions || !expressions.length) return;
      const invokedParentNode = path.parent.parent.node;
      let propsVariable;
      let argMap;
      let isAllSet = false;
      let templateExpression = template;
      if (
        invokedParentNode.type === 'CallExpression' &&
        invokedParentNode.arguments &&
        invokedParentNode.arguments.length === 1 &&
        (invokedParentNode.arguments[0].type === 'ObjectExpression' ||
          invokedParentNode.arguments[0].type === 'Identifier')
      ) {
        ({
          argMap,
          restOrIdent: propsVariable,
          isAllSet
        } = getArguments(invokedParentNode.arguments[0]));

        if (!isAllSet) {
          argMap = undefined;
          propsVariable = undefined;
        } else {
          j(path.parent.parent).replaceWith(path.parent.node);
        }
      }
      if (!argMap && !propsVariable) {
        propsVariable = 'props';
        templateExpression = j.template.expression`(${propsVariable}) => {}`;
        templateExpression.body = path.parent.node;
        template.replaceWith(templateExpression);
      }
      let quasi;
      if (templateExpression.body) {
        ({ quasi } = templateExpression.body);
      } else if (path.parent.node.type === 'TaggedTemplateExpression') {
        quasi = path.parent.node.quasi;
      }
      quasi.expressions = expressions.map((expressionNode) => {
        switch (expressionNode.type) {
          case 'CallExpression':
            return j.callExpression(expressionNode, [
              j.identifier(propsVariable)
            ]);
          case 'ArrowFunctionExpression':
            if (expressionNode.params.length === 0) return expressionNode.body;
            if (
              expressionNode.params[0].type === 'Identifier' &&
              expressionNode.body.type !== 'BlockStatement'
            ) {
              getIdentifierUsages(
                j(expressionNode.body),
                api,
                expressionNode.params[0].name
              ).replaceWith(j.identifier(propsVariable));
              return expressionNode.body;
            }
            if (
              expressionNode.params[0].type === 'ObjectPattern' &&
              (argMap || propsVariable)
            ) {
              if (
                [
                  'ConditionalExpression',
                  'MemberExpression',
                  'ConditionalExpression',
                  'TemplateLiteral',
                  'BinaryExpression'
                ].indexOf(expressionNode.body.type) !== -1
              ) {
                expressionNode.params[0].properties.forEach((property) => {
                  if (property.type === 'ObjectProperty') {
                    let newVarName = property.value.name;
                    if (argMap && argMap[property.value.name]) {
                      newVarName = argMap[property.value.name];
                    } else if (propsVariable) {
                      newVarName = `${propsVariable}.${property.value.name}`;
                    }
                    getIdentifierUsages(
                      j(expressionNode.body),
                      api,
                      property.value.name
                    ).replaceWith(j.identifier(newVarName));
                  }
                });
                return expressionNode.body;
              }
              if (argMap) {
                const newProperties = [];
                expressionNode.params[0].properties.forEach((property) => {
                  const key = property.key.name;
                  if (key === argMap[key]) {
                    const shorthandProperty = j.objectProperty(
                      j.identifier(argMap[key]),
                      j.identifier(argMap[key])
                    );
                    shorthandProperty.shorthand = true;
                    newProperties.push(shorthandProperty);
                  } else if (argMap[key]) {
                    newProperties.push(
                      j.objectProperty(
                        j.stringLiteral(key),
                        j.identifier(argMap[key])
                      )
                    );
                  }
                });

                if (propsVariable) {
                  newProperties.push(
                    j.spreadElement(j.identifier(propsVariable))
                  );
                }

                return j.callExpression(expressionNode, [
                  j.objectExpression(newProperties)
                ]);
              }
            }
            return j.callExpression(expressionNode, [
              j.identifier(propsVariable)
            ]);
          default:
            return expressionNode;
        }
      });
    });
  });

  removeUselessTemplateExpressions(root, api);

  mergeImports(root, api, '@tablekit/utils');
  return root.toSource();
};
