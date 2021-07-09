const getIdentifierUsages = require('./getIdentifierUsages');

// adapted from https://gist.github.com/nemtsov/8f5a6a78268839abaca78ad1fbe8368c
module.exports = function removeUnusedImports(root, api) {
  const j = api.jscodeshift;

  function hasMember(node, localName) {
    if (!node || !node.type) {
      return false;
    }
    if (node.type === 'TSTypeReference' && node.typeName.name === localName) {
      return true;
    }
    if (node.type === 'TSArrayType') {
      return hasMember(node.elementType, localName);
    }
    if (node.type === 'TSTypeLiteral' && node.members.length) {
      return !!node.members.find(
        (member) =>
          member.typeAnnotation &&
          hasMember(member.typeAnnotation.typeAnnotation, localName)
      );
    }
    return false;
  }

  root.find(j.ImportSpecifier).forEach((importPath) => {
    const localName = (importPath.node.local || importPath.node.imported).name;

    const scope = j(importPath).closestScope();
    const scopeIdentifierUsage = getIdentifierUsages(
      scope,
      api,
      localName
    ).filter((p) => {
      if (p.value.start === importPath.value.local.start) {
        return false;
      }
      return true;
    });
    let isUsedInDecorator = false;
    scope.find(j.ClassDeclaration).forEach((classPath) => {
      if (isUsedInDecorator || !classPath.node.decorators) return;
      const usages = getIdentifierUsages(
        j(classPath.node.decorators),
        api,
        localName
      );
      if (usages.size() > 0) {
        isUsedInDecorator = true;
      }
    });

    const isUsedInTypeParam = scope
      .find(j.CallExpression)
      .filter(
        (path) =>
          path.node.typeParameters &&
          path.node.typeParameters.params.find(
            (param) =>
              (param.typeName && param.typeName.name === localName) ||
              hasMember(param, localName)
          )
      )
      .size();

    const isUsedInJsx =
      scope.find(j.JSXIdentifier, { name: localName }).size() > 0;

    if (
      !scopeIdentifierUsage.size() &&
      !isUsedInDecorator &&
      !isUsedInJsx &&
      !isUsedInTypeParam
    ) {
      j(importPath).remove();
    }
  });

  root.find(j.ImportDeclaration).forEach((path) => {
    const importDeclaration = j(path);
    if (importDeclaration.get('specifiers').value.length === 0) {
      importDeclaration.remove();
    }
  });
};
