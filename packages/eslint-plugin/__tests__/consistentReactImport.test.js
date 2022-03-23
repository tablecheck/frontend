const { RuleTester } = require('eslint');

const rule = require('../src/consistentReactImport');

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: 'module' }
});

const messageId = 'consistentReactImport';
const invalidTests = [
  {
    code: `import { useState } from 'react';const [val, setVal] = useState(true);`,
    output: `import * as React from 'react';const [val, setVal] = React.useState(true);`,
    errors: [
      {
        messageId
      }
    ]
  },
  {
    code: `import React, { useState as reactUseState, useCallback } from 'react';const [val, setVal] = reactUseState(true);`,
    output: `import * as React from 'react';const [val, setVal] = React.useState(true);`,
    errors: [
      {
        messageId
      }
    ]
  },
  {
    code: `import { useState, useMemo } from 'react';function useHook() { const [val, setVal] = useState(true); return useMemo(() => val, []) }`,
    output: `import * as React from 'react';function useHook() { const [val, setVal] = React.useState(true); return React.useMemo(() => val, []) }`,
    errors: [
      {
        messageId
      }
    ]
  },
  {
    code: `
    import { useState } from 'react';
    import * as ReactCustom from 'react';
    function useHook() {
      const [val, setVal] = useState(true);
      return ReactCustom.useMemo(() => val, []);
    }`,
    output: `
    import * as ReactCustom from 'react';
    function useHook() {
      const [val, setVal] = ReactCustom.useState(true);
      return ReactCustom.useMemo(() => val, []);
    }`,
    errors: [
      {
        messageId
      }
    ]
  }
];
ruleTester.run('consistentReactImport', rule, {
  valid: [`import * as React from 'react';`].concat(
    invalidTests.map((test) => test.output)
  ),
  invalid: invalidTests
});
