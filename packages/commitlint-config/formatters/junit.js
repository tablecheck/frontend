// @ts-check
/**
 * Forked from archived repo - https://github.com/byCedric/Commitlint-Formats/blob/develop/packages/junit/src/junit.js
 */

/**
 * Indent the message with an indentation level.
 * This will add tabs based on this level.
 *
 * @param  {number} level
 * @param  {string} line
 * @return {string}
 */
function indent(level, line) {
  return `${'  '.repeat(level)}${line}`;
}

/**
 * Escape a string to make it xml safe.
 *
 * @param  {string | number} text
 * @return {string}
 */
function escape(text) {
  const characters = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  };

  return String(text).replace(/[<>&'"]/g, (char) => characters[char]);
}

/**
 * @typedef {Object} CreateElementOptions
 * @property {number} [indent]
 * @property {boolean} [selfClosing]
 * @property {boolean} [noNewline]
 */

/**
 * Create a new XML element containing various properties.
 * It can be configured to automatically add a newline, indentation and make it self closing.
 *
 * @param  {string} tag
 * @param  {CreateElementOptions} options
 * @param  {Object} attributes
 * @return {string}
 */
function createElement(tag, options, attributes) {
  const element = `<${tag}`;
  const closing = options.selfClosing ? ' />' : '>';
  const ending = options.noNewline ? '' : '\n';
  const properties = Object.keys(attributes)
    .map((key) => `${key}="${escape(attributes[key])}"`)
    .join(' ');

  return indent(
    options.indent || 0,
    `${element} ${properties}${closing}${ending}`,
  );
}

/**
 * Format the commitlint report as a valid JUnit XML report.
 *
 * @param  {import('@commitlint/types').FormattableReport} report
 * @return {string}
 */
function formatJunit(report = {}) {
  let output = '';

  output += indent(0, '<?xml version="1.0" encoding="utf-8"?>\n');
  output += indent(0, '<testsuites>\n');

  const { results = [] } = report;

  const { errorCount, warningCount, testsCount } = results.reduce(
    (carry, result) =>
      result.input
        ? carry
        : {
            errorCount: carry.errorCount + (result.errors?.length || 0),
            warningCount: carry.warningCount + (result.warnings?.length || 0),
            testsCount:
              carry.testsCount +
              (result.errors?.length || 0) +
              (result.warnings?.length || 0),
          },
    { errorCount: 0, warningCount: 0, testsCount: 0 },
  );

  output += createElement(
    'testsuite',
    { indent: 1 },
    {
      name: 'commitlint',
      errors: 0,
      failures: errorCount + warningCount,
      tests: testsCount,
    },
  );

  results.forEach((result) => {
    if (!result.input) return;
    const issues = [].concat(result.errors || [], result.warnings || []);

    output += createElement(
      'testsuite',
      { indent: 2 },
      {
        name: result.input.split('\n')[0],
        errors: 0,
        failures: issues.length,
        tests: issues.length || 1,
      },
    );

    if (issues.length > 0) {
      issues.forEach((issue) => {
        const type = issue.level === 2 ? 'error' : 'warning';

        output += createElement(
          'testcase',
          { indent: 3 },
          { name: issue.name },
        );
        output += createElement(
          'failure',
          { indent: 4, noNewline: true },
          { type },
        );
        output += '<![CDATA[';
        output += `${issue.message} (${issue.name})\n`;
        output += ']]>';
        output += '</failure>\n';
        output += indent(3, '</testcase>\n');
      });

      output += indent(2, '</testsuite>\n');
    } else {
      output += createElement(
        'testcase',
        { indent: 3, selfClosing: true },
        { name: 'valid' },
      );
      output += indent(2, '</testsuite>\n');
    }
  });

  output += indent(1, '</testsuite>\n');
  output += indent(0, '</testsuites>\n');

  return output;
}

module.exports = formatJunit;
