module.exports = function getIdentifierUsages(scope, api, identifierName) {
  const j = api.jscodeshift;

  return scope.find(j.Identifier, { name: identifierName }).filter((p) => {
    if (p.parentPath.value.type === 'Property' && p.name === 'key') {
      return false;
    }
    if (p.name === 'property') {
      return false;
    }
    return true;
  });
};
