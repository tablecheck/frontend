const path = require('path');

// https://github.com/eslint/eslint/blob/dd58cd4afa6ced9016c091fc99a702c97a3e44f0/lib/cli-engine/xml-escape.js
/**
 * Returns the escaped value for a character
 * @param {string} s string to examine
 * @returns {string} severity level
 * @private
 */
function xmlEscape(s) {
  // eslint-disable-next-line no-control-regex
  return `${s}`.replace(/[<>&"'\x00-\x1F\x7F\u0080-\uFFFF]/gu, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '"':
        return '&quot;';
      case "'":
        return '&apos;';
      default:
        return `&#${c.charCodeAt(0)};`;
    }
  });
}

// https://github.com/eslint/eslint/blob/dd58cd4afa6ced9016c091fc99a702c97a3e44f0/lib/cli-engine/formatters/junit.js

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

/**
 * Returns the severity of warning or error
 * @param {Object} message message object to examine
 * @returns {string} severity level
 * @private
 */
function getMessageType(message) {
  if (message.fatal || message.severity === 2) {
    return 'Error';
  }
  return 'Warning';
}

/**
 * Returns a full file path without extension
 * @param {string} filePath input file path
 * @returns {string} file path without extension
 * @private
 */
function pathWithoutExt(filePath) {
  return path.join(
    path.dirname(filePath),
    path.basename(filePath, path.extname(filePath))
  );
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = function eslintJunitFormatter(results) {
  let output = '';

  output += '<?xml version="1.0" encoding="utf-8"?>\n';
  output += '<testsuites>\n';

  results.forEach((result) => {
    const { messages } = result;
    const classname = pathWithoutExt(result.filePath);

    if (messages.length > 0) {
      output += `<testsuite package="org.eslint" time="0" tests="${messages.length}" errors="${messages.length}" name="${result.filePath}">\n`;
      messages.forEach((message) => {
        // set warnings as skipped as we don't error on warnings
        const type = message.fatal ? 'error' : 'skipped';

        output += `<testcase time="0" name="org.eslint.${
          message.ruleId || 'unknown'
        }" classname="${classname}">`;
        output += `<${type} message="${xmlEscape(message.message || '')}">`;
        output += '<![CDATA[';
        output += `line ${message.line || 0}, col `;
        output += `${message.column || 0}, ${getMessageType(message)}`;
        output += ` - ${xmlEscape(message.message || '')}`;
        output += message.ruleId ? ` (${message.ruleId})` : '';
        output += ']]>';
        output += `</${type}>`;
        output += '</testcase>\n';
      });
      output += '</testsuite>\n';
    } else {
      output += `<testsuite package="org.eslint" time="0" tests="1" errors="0" name="${result.filePath}">\n`;
      output += `<testcase time="0" name="${result.filePath}" classname="${classname}" />\n`;
      output += '</testsuite>\n';
    }
  });

  output += '</testsuites>\n';

  return output;
};
