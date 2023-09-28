/// <reference types="vitest" />
import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/eslint-plugin',

  plugins: [
    viteTsConfigPaths({
      root: '../../',
    }),
  ],

  test: {
    globals: true,
    outputFile: '../../coverage/packages/eslint-plugin/report.junit.xml',
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
