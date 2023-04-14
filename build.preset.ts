import { definePreset } from 'unbuild';

// @see https://github.com/unjs/unbuild
export default definePreset({
  clean: true,
  declaration: true,
  failOnWarn: false,
  rollup: {
    emitCJS: true,
    inlineDependencies: false,
    esbuild: {
      minify: false,
      sourceMap: true,
      target: 'es2022'
    },
    dts: {
      respectExternal: false
    }
  }
});
