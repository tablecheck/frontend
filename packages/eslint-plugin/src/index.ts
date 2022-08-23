import { forbiddenImports } from './forbiddenImports';
import { maxMixedCss } from './maxMixedCss';
import { consistentReactImport } from './consistentReactImport';

export default {
  rules: {
    'forbidden-imports': forbiddenImports,
    'max-mixed-css': maxMixedCss,
    'consistent-react-import': consistentReactImport
  }
};
