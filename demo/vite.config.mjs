import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Point workspace packages directly at their source so the demo
// works without a prior `pnpm build` (equivalent of `preconstruct dev`).
export default defineConfig({
  plugins: [tailwindcss(), preact()],
  resolve: {
    alias: [
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
