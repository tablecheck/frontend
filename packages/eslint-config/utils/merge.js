/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
module.exports = function mergeDeep(targetArg, ...sources) {
  if (!sources.length) return targetArg;
  const target = { ...targetArg };
  for (let i = 0; i < sources.length; i += 1) {
    const source = sources[i];
    if (isObject(target) && isObject(source)) {
      const keys = Object.keys(source);
      for (let k = 0; k < keys.length; k += 1) {
        const key = keys[k];
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          target[key] = mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  }

  return target;
};
