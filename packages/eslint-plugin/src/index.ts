import { forbiddenImports } from './forbiddenImports';
import { consistentReactImport } from './consistentReactImport';
import { shortestImport } from './shortestImport';

export default {
  rules: {
    'forbidden-imports': forbiddenImports,
    'consistent-react-import': consistentReactImport,
    'prefer-shortest-import': shortestImport,
  },
};
