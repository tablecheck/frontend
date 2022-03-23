module.exports = function addComment(api, node, comment) {
  const j = api.jscodeshift;

  node.comments = node.comments || [];
  if (!node.comments.find(({ value }) => value === comment)) {
    node.comments.push(j.commentLine(comment, true, false));
  }
};
