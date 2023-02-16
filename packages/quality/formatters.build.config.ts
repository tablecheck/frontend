import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  clean: true,
  outDir: 'lib/formatters',
  entries: [
    {
      input: 'src/formatters/eslintStylishFormatter.ts',
      ext: 'js'
    },
    {
      input: 'src/formatters/eslintJunitFormatter.ts',
      ext: 'js'
    }
  ],
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
