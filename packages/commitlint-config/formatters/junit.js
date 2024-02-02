// @ts-check
/**
 * Forked from archived repo - https://github.com/byCedric/Commitlint-Formats/blob/develop/packages/junit/src/junit.js
 */

const builder = require('junit-report-builder');

const levelMap = {
  [0]: 'Disabled',
  [1]: 'Warning',
  [2]: 'Error',
};

/**
 * Format the commitlint report as a valid JUnit XML report.
 *
 * @param  {import('@commitlint/types').FormattableReport} report
 * @return {string}
 */
function formatJunit(report = {}) {
  const { results = [] } = report;

  results.forEach((result) => {
    if (!result.input) return;
    const errorCount = result.errors?.length || 0;
    const warningCount = result.warnings?.length || 0;
    const suite = builder.testSuite().name(result.input);

    result.errors?.forEach((error) => {
      suite
        .testCase()
        .name(error.name)
        .className(levelMap[error.level])
        .error(error.message);
    });

    result.warnings?.forEach((warning) => {
      suite
        .testCase()
        .name(warning.name)
        .className(levelMap[warning.level])
        .failure(warning.message);
    });

    if (errorCount + warningCount === 0) {
      suite.testCase().className('valid').name('valid');
    }
  });

  return builder.name('Commit Lint').build();
}

module.exports = formatJunit;
