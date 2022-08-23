"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurableRuleOverrides = void 0;
exports.configurableRuleOverrides = [];
void import('@tablecheck/frontend-utils').then(function (_a) {
    var _b;
    var userConfig = _a.userConfig;
    var projectTypes = ((_b = userConfig === null || userConfig === void 0 ? void 0 : userConfig.quality) === null || _b === void 0 ? void 0 : _b.projectType) || 'default';
    var projectMaps = typeof projectTypes === 'string'
        ? [['.', projectTypes]]
        : Object.entries(projectTypes);
    projectMaps.forEach(function (_a) {
        var path = _a[0], projectType = _a[1];
        switch (projectType) {
            case 'cli': {
                exports.configurableRuleOverrides.push({
                    files: ["".concat(path, "/**/*.{ts,tsx,js,jsx,mjs,cjs}")],
                    rules: {
                        'import/no-extraneous-dependencies': [
                            'error',
                            {
                                devDependencies: true,
                            },
                        ],
                        'import/no-dynamic-require': 'off',
                        'global-require': 'off',
                        'no-console': 'off',
                        'promise/prefer-await-to-then': 'off',
                        'promise/prefer-await-to-callbacks': 'off',
                        'promise/catch-or-return': 'off',
                        'promise/always-return': 'off',
                        'promise/avoid-new': 'off',
                        'no-underscore-dangle': 'off',
                    },
                });
                break;
            }
            case 'react-framework': {
                exports.configurableRuleOverrides.push({
                    files: ["".concat(path, "/**/*.{ts,tsx,js,jsx,mjs,cjs}")],
                    rules: {
                        'import/no-default-export': 'warn',
                    },
                });
                break;
            }
            default: {
                break;
            }
        }
    });
});
//# sourceMappingURL=configurable.js.map