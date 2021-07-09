const mergeImports = require('../utils/mergeImports');
const renameImports = require('../utils/renameImports');

const cssTransform = require('./tablekit-utils-3-css');
const variantTransform = require('./tablekit-utils-3-variant');

module.exports = function tablekitUtils3Transform(file, api) {
  const j = api.jscodeshift;

  const root = j(file.source);

  mergeImports(root, api, '@tablekit/utils', [
    '@tablekit/utils/lib/types',
    '@tablekit/utils/types'
  ]);

  const utilsImport = root.find(j.ImportDeclaration, {
    source: {
      type: 'StringLiteral',
      value: '@tablekit/utils'
    }
  });

  if (utilsImport.size() === 0) {
    return file.source;
  }

  renameImports(root, api, '@tablekit/utils', {
    MediaQueryPropType: 'MediaQuery',
    MediaQueryType: 'MediaQuery'
  });

  mergeImports(root, api, '@tablekit/utils');
  return [cssTransform, variantTransform].reduce(
    (source, transformer) => transformer({ ...file, source }, api),
    root.toSource()
  );
};
