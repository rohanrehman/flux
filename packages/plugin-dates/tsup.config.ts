import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['preact', 'preact/compat', 'preact/hooks', 'flux'],
  jsx: 'react-jsx',
  esbuildOptions(options) {
    options.jsxImportSource = 'preact'
  },
  treeshake: true,
})
