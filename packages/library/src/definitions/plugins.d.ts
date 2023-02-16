declare module '@rollup/plugin-commonjs';
declare module '@rollup/plugin-node-resolve' {
  export { nodeResolve } from '@rollup/plugin-node-resolve/types/index.d.ts';
}

declare module 'rollup-plugin-node-externals' {
  export { externals } from 'rollup-plugin-node-externals/dist/index.d.ts';
}
