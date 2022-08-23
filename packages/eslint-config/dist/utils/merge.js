"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeDeep = void 0;
var tslib_1 = require("tslib");
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
function mergeDeep(targetArg) {
    var _a, _b;
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    if (!sources.length)
        return targetArg;
    var target = tslib_1.__assign({}, targetArg);
    for (var i = 0; i < sources.length; i += 1) {
        var source = sources[i];
        if (isObject(target) && isObject(source)) {
            var keys = Object.keys(source);
            for (var k = 0; k < keys.length; k += 1) {
                var key = keys[k];
                if (isObject(source[key])) {
                    if (!target[key])
                        Object.assign(target, (_a = {}, _a[key] = {}, _a));
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    target[key] = mergeDeep(target[key], source[key]);
                }
                else {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    Object.assign(target, (_b = {}, _b[key] = source[key], _b));
                }
            }
        }
    }
    return target;
}
exports.mergeDeep = mergeDeep;
//# sourceMappingURL=merge.js.map