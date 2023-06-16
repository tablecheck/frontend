import { consistentReactImport } from './consistentReactImport';
import { forbiddenImports } from './forbiddenImports';
import { shortestImport } from './shortestImport';

module.exports = {
  rules: {
    'forbidden-imports': forbiddenImports,
    'consistent-react-import': consistentReactImport,
    'prefer-shortest-import': shortestImport,
  },
};
