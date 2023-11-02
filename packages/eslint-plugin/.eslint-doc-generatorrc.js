const prettier = require('prettier');

/** @type {import('eslint-doc-generator').GenerateOptions} */
const config = {
  postprocess: async (content, path) => {
    const prettierRC = await prettier.resolveConfig(path);
    return prettier.format(content, { ...prettierRC, parser: 'markdown' });
  },
};

module.exports = config;
