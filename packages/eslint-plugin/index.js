module.exports = {
  rules: {
    'forbidden-imports': require('./src/forbiddenImports'),
    'max-mixed-css': require('./src/maxMixedCss'),
    'consistent-react-import': require('./src/consistentReactImport')
  }
};
