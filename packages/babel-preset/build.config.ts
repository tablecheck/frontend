import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  preset: '../../build.preset',
  outDir: 'lib',
  entries: ['src/index']
});
