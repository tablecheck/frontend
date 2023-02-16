import { describe, test, expect } from 'vitest';

import { rollup } from 'rollup';
import { jsxPlugin } from './jsxPlugin.js';

function testCode(name: string, filePath: string, isEmotion: boolean) {
  test(`${name} ${isEmotion ? 'with emotion' : 'vanilla react'}`, async () => {
    const resolvedFilePath = require.resolve(filePath);
    const bundle = await rollup({
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
        jsxPlugin(isEmotion)
      ]
    });
    const generated = await bundle.generate({ format: 'esm' });
    expect(generated.output[0].code).toMatchSnapshot();
  });
}

describe('scripts/jsxPlugin', () => {
  [true, false].forEach((useEmotion) => {
    testCode(
      'should handle basic JSX elements',
      './fixtures/basic.jsx',
      useEmotion
    );

    testCode(
      'should handle varying import patterns',
      './fixtures/importedComponents.jsx',
      useEmotion
    );

    testCode(
      'should handle name clashes',
      './fixtures/variableNameClashes.jsx',
      useEmotion
    );

    testCode(
      'should handle import alias spread',
      './fixtures/aliasSpread.jsx',
      useEmotion
    );

    testCode(
      'should handle emotion css',
      './fixtures/emotionCss.jsx',
      useEmotion
    );
  });
});
