const rollup = require('rollup');
const { jsxPlugin } = require('./jsxPlugin');

function testCode(name, filePath) {
  // eslint-disable-next-line jest/valid-title
  test(name, async () => {
    const resolvedFilePath = require.resolve(filePath);
    const bundle = await rollup.rollup({
      input: resolvedFilePath,
      plugins: [
        {
          name: 'exclude-assets',
          resolveId(id) {
            if (id === resolvedFilePath) return null;
            // pretend all imports are external
            return { id, external: true };
          }
        },
        jsxPlugin()
      ]
    });
    const generated = await bundle.generate({ format: 'esm' });
    expect(generated.output[0].code).toMatchSnapshot();
  });
}

describe('scripts/jsxPlugin', () => {
  testCode('should handle basic JSX elements', './fixtures/basic.jsx');

  testCode(
    'should handle varying import patterns',
    './fixtures/importedComponents.jsx'
  );

  testCode('should handle name clashes', './fixtures/variableNameClashes.jsx');

  testCode('should handle import alias spread', './fixtures/aliasSpread.jsx');

  testCode('should handle emotion css', './fixtures/emotionCss.jsx');
});
