const rollup = require('rollup');
const { jsxPlugin } = require('./jsxPlugin');

function testCode(name, filePath, usePackageWithEmotionReact = false) {
  // eslint-disable-next-line jest/valid-title
  test(name, async () => {
    const resolvedFilePath = require.resolve(filePath);
    const packagePath = usePackageWithEmotionReact
      ? './fixtures/packageWithEmotionReact.json'
      : './fixtures/packageWithReact.json';
    const resolvedPackagePath = require.resolve(packagePath);
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
        jsxPlugin(resolvedPackagePath)
      ]
    });
    const generated = await bundle.generate({ format: 'esm' });
    expect(generated.output[0].code).toMatchSnapshot();
  });
}

describe('scripts/jsxPlugin with "react"', () => {
  testCode('should handle basic JSX elements', './fixtures/basic.jsx');

  testCode(
    'should handle varying import patterns',
    './fixtures/importedComponents.jsx'
  );

  testCode('should handle name clashes', './fixtures/variableNameClashes.jsx');

  testCode('should handle import alias spread', './fixtures/aliasSpread.jsx');

  testCode('should handle emotion css', './fixtures/emotionCss.jsx');
});

describe('scripts/jsxPlugin with "@emotion/react"', () => {
  testCode('should handle basic JSX elements', './fixtures/basic.jsx', true);

  testCode(
    'should handle varying import patterns',
    './fixtures/importedComponents.jsx',
    true
  );

  testCode(
    'should handle name clashes',
    './fixtures/variableNameClashes.jsx',
    true
  );

  testCode(
    'should handle import alias spread',
    './fixtures/aliasSpread.jsx',
    true
  );

  testCode('should handle emotion css', './fixtures/emotionCss.jsx', true);
});
