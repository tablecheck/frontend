const fs = require('fs-extra');
const path = require('path');
const { ESLint } = require('eslint');

const paths = require('../../config/paths');

async function runEslint(eslintRcFile, eslintPaths, shouldAutoFix) {
  try {
    const overrideConfigFile =
      require(paths.appPackageJson).name === 'tablecheck-react-system'
        ? path.join(paths.cwd, '.eslintrc.js')
        : `./${eslintRcFile}`;
    const eslint = new ESLint({
      cwd: paths.cwd,
      fix: shouldAutoFix,
      overrideConfigFile,
      useEslintrc: false,
      errorOnUnmatchedPattern: false
    });
    const results = await eslint.lintFiles(eslintPaths);
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
  }
}

module.exports = {
  runEslint
};
