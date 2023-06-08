import { defineConfig } from 'tsup'

import type { Options } from 'tsup'

/* eslint-disable no-param-reassign */

const baseOptions = {
  entry: ['src/index.ts'],
  treeshake: true,
  sourcemap: true,
  minify: false,
  clean: true,
  /**
   * @link https://stackoverflow.com/questions/31931614/require-is-not-defined-node-js
   */
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
  },
  platform: 'node',
  shims: true,
} satisfies Options

export default defineConfig([
  {
    ...baseOptions,
    format: 'esm',
    dts: true,
    splitting: false,
  },
  {
    ...baseOptions,
    format: 'cjs',
    dts: {
      compilerOptions: {
        target: 'ES5',
        module: 'commonjs',
        moduleResolution: 'node',
      },
    },
  },
  {
    ...baseOptions,
    entry: ['src/client.ts'],
    name: 'client',
    format: 'esm',
    dts: true,
    splitting: false,
  },
  {
    ...baseOptions,
    entry: ['src/index.ts'],
    name: 'client',
    format: 'cjs',
    dts: {
      compilerOptions: {
        target: 'ES5',
        module: 'commonjs',
        moduleResolution: 'node',
      },
    },
  },
])
