function assertsIsObject(
  item: unknown,
): asserts item is Record<string, unknown> {}
function isObject(item: unknown) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep<T>(targetArg: T, ...sources: T[]): T {
  if (!sources.length) return targetArg;
  const target = { ...targetArg };
  for (const source of sources) {
    if (isObject(target) && isObject(source)) {
      assertsIsObject(target);
      assertsIsObject(source);
      const keys = Object.keys(source as Record<string, unknown>);
      for (const key of keys) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} } as T);

          (target as never as Record<string, unknown>)[key] = mergeDeep(
            target[key],
            source[key],
          );
        } else {
          Object.assign(target, { [key]: source[key] } as T);
        }
      }
    }
  }

  return target;
}
