import { forbiddenImports } from './forbiddenImports';
import { consistentReactImport } from './consistentReactImport';

export default {
  rules: {
    'forbidden-imports': forbiddenImports,
    'consistent-react-import': consistentReactImport
  }
};
