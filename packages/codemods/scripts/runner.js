const prettier = require('prettier');

const removeUnusedImports = require('../utils/removeUnusedImports');

module.exports = function runner(file, api, options) {
  const script = options['tc-script'];
  if (!script) return file.source;

  const j = api.jscodeshift;
  let root = j(file.source);

  const getFirstNode = () => root.find(j.Program).get('body', 0).node;

  // from https://github.com/facebook/jscodeshift/blob/master/recipes/retain-first-comment.md
  // Save the comments attached to the first node
  const firstNode = getFirstNode();
  const { comments } = firstNode;

  root = j(require(`./${script}`)(file, api, options));

  removeUnusedImports(root, api);

  // If the first node has been modified or deleted, reattach the comments
  const firstNode2 = getFirstNode();
  if (firstNode2 !== firstNode) {
    firstNode2.comments = comments;
  }

  const prettierOptions = prettier.resolveConfig.sync(file.path);
  return prettier.format(root.toSource(), {
    ...prettierOptions,
    filepath: file.path
  });
};
