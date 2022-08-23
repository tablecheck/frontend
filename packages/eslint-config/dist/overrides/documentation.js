"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentationOverrides = void 0;
exports.documentationOverrides = {
    files: [
        '**/__fixtures__/**/*',
        '**/*.fixture.{js,jsx}',
        '**/*.{stories,story}.{js,jsx}',
        '.storybook/**/*.{js,jsx}',
    ],
    rules: {
        'no-console': 'off',
        'import/no-default-export': 'off',
        'react-hooks/rules-of-hooks': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'react/function-component-definition': 'off',
        'react/jsx-no-constructed-context-values': 'off',
    },
};
//# sourceMappingURL=documentation.js.map