import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    plugin: 'src/plugin/index.ts',
    headless: 'src/headless/index.ts',
    optional: 'src/optional/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['preact', 'preact/compat', 'preact/hooks'],
  jsx: 'react-jsx',
  esbuildOptions(options) {
    options.jsxImportSource = 'preact'
    options.conditions = ['style']
  },
  treeshake: true,
  sourcemap: false,
})
