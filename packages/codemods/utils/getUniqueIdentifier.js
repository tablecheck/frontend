const getIdentifierUsages = require('./getIdentifierUsages');

module.exports = function getUniqueIdentifier(root, api, originalName) {
  let name = originalName;
  let namedNodes = getIdentifierUsages(root, api, name);
  while (namedNodes.length) {
    name += '__TEMP';
    namedNodes = getIdentifierUsages(root, api, name);
  }
  return name;
};
