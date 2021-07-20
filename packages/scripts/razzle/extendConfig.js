const { produce, setAutoFreeze } = require('immer');
const uniq = require('lodash/uniq');
const merge = require('lodash/merge');

setAutoFreeze(false);

function composeProduceResult(targetKey, result) {
  if (
    targetKey === 'modifyWebpackOptions' &&
    result.options &&
    result.options.webpackOptions
  )
    return result.options.webpackOptions;

  if (targetKey === 'modifyWebpackConfig' && result.webpackConfig)
    return result.webpackConfig;

  // if we get to this point it means that the produce returned the modified object
  // and didn't mutate via immer
  return result;
}

function extendModify(key, baseModifyFunc, extendModifyFunc) {
  if (!baseModifyFunc && !extendModifyFunc)
    return (options) => composeProduceResult(key, options);
  return (options) => {
    const baseProduce = (draft) => baseModifyFunc(draft);
    const extendProduce = (draft) => extendModifyFunc(draft);
    if (!extendModifyFunc) {
      return composeProduceResult(key, produce(baseProduce)(options));
    }
    if (!baseModifyFunc) {
      return composeProduceResult(key, produce(extendProduce)(options));
    }
    const baseResult = composeProduceResult(key, produce(baseProduce)(options));
    const extendOptions = produce((optionsDraft) => {
      if (key === 'modifyWebpackOptions') {
        optionsDraft.options = optionsDraft.options || {};
        optionsDraft.options.webpackOptions = baseResult;
      }
      if (key === 'modifyWebpackConfig') {
        optionsDraft.webpackConfig = baseResult;
      }
    })(options);
    const extended = produce(extendProduce)(extendOptions);
    return composeProduceResult(key, extended);
  };
}

function extendConfig(baseConfig, extendedConfig) {
  const baseKeys = Object.keys(baseConfig);
  const extendedKeys = Object.keys(extendedConfig);
  const allKeys = uniq(baseKeys.concat(extendedKeys));
  const resolvedConfig = produce((configDraft) => {
    allKeys.forEach((key) => {
      if (key.match(/^modify/)) {
        configDraft[key] = extendModify(
          key,
          configDraft[key],
          extendedConfig[key]
        );
      } else if (!configDraft[key]) {
        configDraft[key] = extendedConfig[key];
      } else if (
        typeof configDraft[key] === 'object' &&
        typeof extendedConfig[key] === 'object'
      ) {
        // "object like" use lodash merge, handles arrays and objects which satisfy this condition.
        merge(configDraft[key], extendedConfig[key]);
      } else {
        configDraft[key] = extendedConfig[key] || configDraft[key];
      }
    });
    configDraft.extend = (newExtendConfig) =>
      extendConfig(resolvedConfig, newExtendConfig);
  })(baseConfig);

  return resolvedConfig;
}

module.exports = {
  extendModify,
  extendConfig
};
