import { RuleTester } from '@typescript-eslint/rule-tester';

import {
  consistentReactImport as rule,
  messageId,
} from '../src/consistentReactImport';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.test.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
});

const filename = './test_src/default.tsx';
const invalidTests = [
  {
    code: `import { useState } from 'react';const [val, setVal] = useState(true);`,
    output: `import * as React from 'react';const [val, setVal] = React.useState(true);`,
  },
  {
    code: `import React, { useState as reactUseState, useCallback } from 'react';const [val, setVal] = reactUseState(true);`,
    output: `import * as React from 'react';const [val, setVal] = React.useState(true);`,
  },
  {
    code: `import { useState, useMemo } from 'react';function useHook() { const [val, setVal] = useState(true); return useMemo(() => val, []) }`,
    output: `import * as React from 'react';function useHook() { const [val, setVal] = React.useState(true); return React.useMemo(() => val, []) }`,
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
  },
].map((test) => ({
  ...test,
  errors: [
    {
      messageId,
    },
  ],
  filename,
}));

ruleTester.run('consistentReactImport', rule, {
  valid: [`import * as React from 'react';`]
    .concat(invalidTests.map((test) => test.output))
    .map((code) => ({
      code,
      filename,
    })),
  invalid: invalidTests,
});
