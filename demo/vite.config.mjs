import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Phaze JSX runtime — set globally so every .tsx/.jsx in the demo gets
// the right transform without per-file `/** @jsxImportSource */` pragmas.
// Workspace package src paths are aliased so the demo runs without a
// prior `pnpm build` (equivalent of `preconstruct dev`).
export default defineConfig({
  plugins: [tailwindcss()],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '@madenowhere/phaze',
  },
  resolve: {
    alias: [
      { find: '@rohanrehman/flux/plugin', replacement: path.resolve(__dirname, '../packages/flux/src/plugin/index.ts') },
      { find: '@rohanrehman/flux/headless', replacement: path.resolve(__dirname, '../packages/flux/src/headless/index.ts') },
      { find: '@rohanrehman/flux/dist/flux.core.css', replacement: path.resolve(__dirname, '../packages/flux/src/styles/flux.core.css') },
      { find: '@rohanrehman/flux/dist/flux.css', replacement: path.resolve(__dirname, '../packages/flux/src/styles/flux.css') },
      { find: '@rohanrehman/flux', replacement: path.resolve(__dirname, '../packages/flux/src/index.ts') },
      // Bare `flux` and `flux/...` still alias to the workspace package
      // because some legacy sandbox imports may still use the short name.
      { find: 'flux/plugin', replacement: path.resolve(__dirname, '../packages/flux/src/plugin/index.ts') },
      { find: 'flux/headless', replacement: path.resolve(__dirname, '../packages/flux/src/headless/index.ts') },
      { find: 'flux/dist/flux.core.css', replacement: path.resolve(__dirname, '../packages/flux/src/styles/flux.core.css') },
      { find: 'flux/dist/flux.css', replacement: path.resolve(__dirname, '../packages/flux/src/styles/flux.css') },
      { find: 'flux', replacement: path.resolve(__dirname, '../packages/flux/src/index.ts') },
      { find: '@flux-ui/plugin-spring', replacement: path.resolve(__dirname, '../packages/plugin-spring/src/index.ts') },
      { find: '@flux-ui/plugin-dates', replacement: path.resolve(__dirname, '../packages/plugin-dates/src/index.ts') },
      { find: '@flux-ui/plugin-bezier', replacement: path.resolve(__dirname, '../packages/plugin-bezier/src/index.ts') },
      { find: '@flux-ui/plugin-plot', replacement: path.resolve(__dirname, '../packages/plugin-plot/src/index.ts') },
    ],
  },
})
