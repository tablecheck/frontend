/**
 * we need to manually inject react-devtools to support safari debugging
 */
module.exports = function applyReactDevTools(webpackConfig, { dev, target }) {
  if (
    process.env.ENABLE_REACT_DEVTOOLS !== 'true' ||
    !dev ||
    target !== 'web'
  ) {
    return;
  }
  Object.keys(webpackConfig.entry).forEach((entryKey) => {
    // TODO do better... https://github.com/facebook/react/issues/20095
    webpackConfig.entry[entryKey].unshift('react-devtools');
  });
};
