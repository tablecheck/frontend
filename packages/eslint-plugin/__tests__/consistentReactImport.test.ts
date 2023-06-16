import * as path from 'path';

import {
  consistentReactImport as rule,
  messageId,
} from '../src/consistentReactImport';

import { initRuleTester } from './utils';

const ruleTester = initRuleTester({
  parser: path.resolve(
    './packages/eslint-plugin/node_modules/@typescript-eslint/parser',
  ),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});

const invalidTests = [
  {
    code: `import { useState } from 'react';const [val, setVal] = useState(true);`,
    output: `import * as React from 'react';const [val, setVal] = React.useState(true);`,
    errors: [
      {
        messageId,
      },
    ],
  },
  {
    code: `import React, { useState as reactUseState, useCallback } from 'react';const [val, setVal] = reactUseState(true);`,
    output: `import * as React from 'react';const [val, setVal] = React.useState(true);`,
    errors: [
      {
        messageId,
      },
    ],
  },
  {
    code: `import { useState, useMemo } from 'react';function useHook() { const [val, setVal] = useState(true); return useMemo(() => val, []) }`,
    output: `import * as React from 'react';function useHook() { const [val, setVal] = React.useState(true); return React.useMemo(() => val, []) }`,
    errors: [
      {
        messageId,
      },
    ],
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
        messageId,
      },
    ],
  },
  {
    code: `
    import { Fragment } from 'react';
    function Component() {
      return <Fragment>Something</Fragment>;
    }`,
    output: `
    import * as React from 'react';
    function Component() {
      return <React.Fragment>Something</React.Fragment>;
    }`,
    errors: [
      {
        messageId,
      },
    ],
  },
  {
    code: `
    import { Fragment as Fr } from 'react';
    function Component() {
      return <Fr>Something</Fr>;
    }`,
    output: `
    import * as React from 'react';
    function Component() {
      return <React.Fragment>Something</React.Fragment>;
    }`,
    errors: [
      {
        messageId,
      },
    ],
  },
  {
    code: `
    import { Fragment } from 'react';
    function Component() {
      return <Fragment key="one">Something</Fragment>;
    }`,
    output: `
    import * as React from 'react';
    function Component() {
      return <React.Fragment key="one">Something</React.Fragment>;
    }`,
    errors: [
      {
        messageId,
      },
    ],
  },
  {
    code: `
    import { Fragment } from 'react';
    function Component() {
      return <Fragment key="one"><div><>Inner <Fragment>Center</Fragment></> Outer</div></Fragment>;
    }`,
    output: `
    import * as React from 'react';
    function Component() {
      return <React.Fragment key="one"><div><>Inner <React.Fragment>Center</React.Fragment></> Outer</div></React.Fragment>;
    }`,
    errors: [
      {
        messageId,
      },
    ],
  },
];

ruleTester.run('consistentReactImport', rule, {
  valid: [`import * as React from 'react';`].concat(
    invalidTests.map((test) => test.output),
  ),
  invalid: invalidTests,
});
