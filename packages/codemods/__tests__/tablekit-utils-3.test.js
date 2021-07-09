const path = require('path');

const fs = require('fs-extra');
const jscodeshift = require('jscodeshift');
const getCodeshiftParser = require('jscodeshift/src/getParser');

const codeshift = require('../scripts/tablekit-utils-3');

const testFilesDirectory = path.resolve('./testFiles');
const files = fs.readdirSync(testFilesDirectory);

function getCodeshiftResult(fileContent) {
  return codeshift(
    { source: fileContent },
    {
      jscodeshift: jscodeshift.withParser(getCodeshiftParser('tsx', {}))
    }
  );
}

describe('tablekit-utils-3', () => {
  test.each(files)('should convert %s', (fileName) => {
    expect(
      getCodeshiftResult(
        fs.readFileSync(path.join(testFilesDirectory, fileName), {
          encoding: 'utf8'
        })
      )
    ).toMatchSnapshot();
  });
});
