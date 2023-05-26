import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  preset: '../../build.preset',
  outDir: 'dist',
  entries: ['src/bin/main.ts', 'src/bin/lint.ts', 'src/bin/precommit.ts'],
  rollup: {
    emitCJS: false,
    inlineDependencies: false,
    esbuild: {
      minify: false,
      sourceMap: true,
      target: 'es2022',
    },
    dts: {
      respectExternal: false,
    },
  },
});
