const getIdentifierUsages = require('./getIdentifierUsages');

module.exports = function getUsages(scope, api, identifierName) {
  return getIdentifierUsages(scope, api, identifierName).filter(
    (path) =>
      path.parent.node.type !== 'ObjectProperty' &&
      path.parent.node.type !== 'ImportSpecifier' &&
      path.parent.node.type !== 'ImportDefaultSpecifier'
  );
};
