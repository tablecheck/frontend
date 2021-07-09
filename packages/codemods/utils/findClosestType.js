module.exports = function findClosestType(path, ...types) {
  let matchingParent = path.parent;
  while (
    matchingParent.parent &&
    types.indexOf(matchingParent.node.type) === -1 &&
    matchingParent.node.type !== 'Program'
  ) {
    matchingParent = matchingParent.parent;
  }
  return matchingParent.node.type === 'Program' ? null : matchingParent;
};
