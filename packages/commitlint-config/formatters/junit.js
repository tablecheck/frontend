// @ts-check
/**
 * Forked from archived repo - https://github.com/byCedric/Commitlint-Formats/blob/develop/packages/junit/src/junit.js
 */

const builder = require('junit-report-builder');

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
    suite.property('errors', errorCount);
    suite.property('failures', errorCount + warningCount);
    suite.property('tests', Math.max(errorCount + warningCount, 1));
    suite.property('skipped', 0);

    result.errors?.forEach((error) => {
      const testcase = suite.testCase().className('error').name(error.name);
      testcase.failure('error').standardOutput(error.message);
    });

    result.warnings?.forEach((warning) => {
      const testcase = suite.testCase().className('warning').name(warning.name);
      testcase.failure('warning').standardOutput(warning.message);
    });

    if (errorCount + warningCount === 0) {
      suite.testCase().className('valid').name('valid');
    }
  });

  return builder.build();
}

module.exports = formatJunit;
