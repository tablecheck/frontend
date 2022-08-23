"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable import/no-import-module-exports */
var consistentReactImport_1 = require("./consistentReactImport");
var forbiddenImports_1 = require("./forbiddenImports");
var shortestImport_1 = require("./shortestImport");
module.exports = {
    rules: {
        'forbidden-imports': forbiddenImports_1.forbiddenImports,
        'consistent-react-import': consistentReactImport_1.consistentReactImport,
        'prefer-shortest-import': shortestImport_1.shortestImport,
    },
};
//# sourceMappingURL=index.js.map