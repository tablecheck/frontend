module.exports = function constToEnum(j, path, newIdentifier, memberMap) {
  const parentType = path.parent.node.type;
  if (parentType === 'MemberExpression') {
    j(path.parent).replaceWith(
      j.memberExpression(
        j.identifier(newIdentifier),
        j.identifier(memberMap[path.parent.node.property.name])
      )
    );
  } else if (
    parentType === 'TSTypeReference' &&
    path.parent.parent.node.type === 'TSTypeOperator'
  ) {
    j(path.parent.parent).replaceWith(
      j.tsTypeReference(j.identifier(newIdentifier))
    );
  } else if (parentType === 'TSTypeQuery' || parentType === 'TSTypeReference') {
    if (
      path.parent.parent.parent.node.type === 'TSTypeReference' &&
      path.parent.parent.parent.node.typeName &&
      path.parent.parent.parent.node.typeName.name === '$Values'
    ) {
      j(path.parent.parent.parent).replaceWith(j.identifier(newIdentifier));
    } else {
      j(path.parent).replaceWith(j.identifier(newIdentifier));
    }
  } else {
    j(path).replaceWith(j.identifier(newIdentifier));
  }
};
