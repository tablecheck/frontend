import { initRuleTester } from './utils';
import { maxMixedCss as rule, messageId } from '../src/maxMixedCss';

const ruleTester = initRuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
});

const buildCases = (template) => [
  `
import { css } from '@emotion/core';
import styled from '@emotion/styled';
const Component = styled.div${template}
`,
  `
import { css } from '@emotion/core';
const style = css${template}
`,
  `
import { css as reactCss, css } from '@emotion/react';
const style = reactCss${template}
`
];

const buildDoubleCases = (template) => [
  `
import { css } from '@emotion/core';
import styled from '@emotion/styled';
const Component1 = styled.div${template};
const Component2 = styled.div${template};
`,
  `
import { css } from '@emotion/core';
const style1 = css${template};
const style2 = css${template};
`,
  `
import { css as reactCss, css } from '@emotion/react';
const style1 = reactCss${template};
const style2 = reactCss${template};
`
];

const simpleTemplate = `\`
  line 1;
  line 2;
  
  line 3;
\``;
const singleTestCases = buildCases(simpleTemplate);
const doubleTestCases = buildDoubleCases(simpleTemplate);

const interpolationTemplate = `\`
  line 1;
  line 2;
  \${theme => theme.something ?
    \`some other text\` :
    'big blue'
  }
  line 3;
\``;
const interpolationTestCases = buildCases(interpolationTemplate);
const doubleInterpolationTestCases = buildDoubleCases(interpolationTemplate);

const nestedTemplate = `\`
  line 1;
  line 2;
  \${theme => theme.something ?
    css\`line 3;\` :
    'big blue'
  }
  line 4;
\``;
const nestedTestCases = buildCases(nestedTemplate);
const doubleNestedTestCases = buildDoubleCases(nestedTemplate);

ruleTester.run('maxMixedCss', rule, {
  valid: singleTestCases
    .concat(interpolationTestCases)
    .map((code) => ({
      code,
      options: [3]
    }))
    .concat(
      [
        {
          code: `
    import { md } from 'markdown';
    const text = md\`
      Line 1
      Line 2
      Line 3
      Line 4
      Line 5
      Line 6
    \`;
    `,
          options: [0]
        }
      ],
      nestedTestCases.map((code) => ({
        code,
        options: [4]
      })),
      doubleNestedTestCases.map((code) => ({
        code,
        options: [8]
      }))
    )
    .map((config) => ({
      ...config,
      code: `${config.code};
    const BigComponent = () => {
    const line1 = '';
    const line2 = '';
    const line3 = '';
    const line4 = '';
    const line5 = '';
    return (<div>
      <p></p>
      </div>);
    };`
    })),
  invalid: singleTestCases
    .concat(interpolationTestCases, nestedTestCases)
    .map((code) => ({
      code,
      options: [2],
      errors: [
        {
          messageId,
          data: {
            lines: 2
          }
        }
      ]
    }))
    .concat(
      doubleTestCases.concat(doubleInterpolationTestCases).map((code) => ({
        code,
        options: [3],
        errors: [
          {
            messageId,
            data: {
              lines: 3
            }
          }
        ]
      })),
      doubleNestedTestCases.map((code) => ({
        code,
        options: [7],
        errors: [
          {
            messageId,
            data: {
              lines: 7
            }
          }
        ]
      }))
    )
    .map((config) => ({
      ...config,
      code: `${config.code};
    const BigComponent = () => {
    const line1 = '';
    const line2 = '';
    const line3 = '';
    const line4 = '';
    const line5 = ''
    return (<div>
      <p></p>
      </div>);
    };`
    }))
});
