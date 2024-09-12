// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable import/no-import-module-exports */
import { consistentReactImport } from './consistentReactImport';
import { shortestImport } from './shortestImport';

module.exports = {
  rules: {
    'consistent-react-import': consistentReactImport,
    'prefer-shortest-import': shortestImport,
  },
};
