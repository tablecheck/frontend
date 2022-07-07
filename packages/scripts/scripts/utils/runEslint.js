const fs = require('fs-extra');
const path = require('path');
const { ESLint } = require('eslint');

const paths = require('../../config/paths');

async function runEslint(eslintPaths, shouldAutoFix) {
  let results = [];
  try {
    const isThisMonorepo =
      require(paths.appPackageJson).name === 'tablecheck-react-system';
    const overrideConfigFile = isThisMonorepo
      ? path.join(paths.cwd, '.eslintrc.js')
      : undefined;
    const eslint = new ESLint({
      cwd: paths.cwd,
      fix: shouldAutoFix,
      overrideConfigFile,
      useEslintrc: isThisMonorepo ? false : undefined,
      errorOnUnmatchedPattern: false,
      reportUnusedDisableDirectives: 'error'
    });
    results = await eslint.lintFiles(eslintPaths);
    if (shouldAutoFix) {
      await ESLint.outputFixes(results);
    }
    const cliFormatter = await eslint.loadFormatter(
      require.resolve('../../config/eslintStylishFormatter.js')
    );
    const junitFormatter = await eslint.loadFormatter(
      require.resolve('../../config/eslintJunitFormatter.js')
    );
    console.log(cliFormatter.format(results));
    fs.outputFileSync(
      path.join(paths.cwd, 'junit', 'eslint.xml'),
      junitFormatter.format(results),
      'utf8'
    );
  } catch (e) {
    console.error('eslint error', e);
    throw e;
  }
  for (let i = 0; i < results.length; i += 1) {
    const result = results[i];
    if (result.errorCount || result.fatalErrorCount) {
      throw new Error('Eslint detected errors');
    }
  }
}

module.exports = {
  runEslint
};
