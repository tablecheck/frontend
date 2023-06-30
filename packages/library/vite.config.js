/// <reference types="vitest" />
import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

// This is an ultra weird hack to get vite-tsconfig-paths to work.
// The lib doesn't seem to correctly define esm/cjs (or we have something weird in our setup)
const resolvedTsPaths =
  typeof viteTsConfigPaths === 'function'
    ? viteTsConfigPaths
    : viteTsConfigPaths.default;
export default defineConfig({
  cacheDir: '../../node_modules/.vite/library',

  plugins: [
    resolvedTsPaths({
      root: '../../',
    }),
  ],

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
