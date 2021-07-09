const { produce, setAutoFreeze } = require('immer');
const uniq = require('lodash/uniq');
const merge = require('lodash/merge');

setAutoFreeze(false);

function extendModify(key, baseModifyFunc, extendModifyFunc) {
  return (options) => {
    const targetKey = key.replace(
      /^modify([A-Z])(.+)/gi,
      (substring, firstLetter, remaining) =>
        `${firstLetter.toLowerCase()}${remaining}`
    );
    const baseProduce = (draft) => baseModifyFunc(draft);
    const extendProduce = (draft) => extendModifyFunc(draft);
    if (!extendModifyFunc) {
      return produce(baseProduce)(options);
    }
    if (!baseModifyFunc) {
      return produce(extendProduce)(options);
    }
    const modifyTarget = produce(baseProduce)(options);
    return produce((draftTarget) => {
      if (targetKey === 'webpackOptions') {
        return extendProduce({
          ...options,
          options: {
            ...options.options,
            webpackOptions: draftTarget
          }
        });
      }
      return extendProduce({
        ...options,
        [targetKey]: draftTarget
      });
    })(modifyTarget);
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
