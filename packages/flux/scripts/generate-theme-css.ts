/**
 * Generates the CSS custom-property block in flux.core.css from theme.ts.
 * Run with: node scripts/generate-theme-css.ts  (Node 22.6+ strips TS natively)
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDefaultTheme } from '../src/styles/theme.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSS_FILE = join(__dirname, '../src/styles/flux.core.css')

const START = '/* [generated-theme-vars:start] */'
const END = '/* [generated-theme-vars:end] */'

function generateVarsBlock(): string {
  const theme = getDefaultTheme()
  const lines: string[] = [':root,', '.flux-root {']

  for (const category of Object.keys(theme) as (keyof typeof theme)[]) {
    lines.push('')
    for (const [key, value] of Object.entries(theme[category] as Record<string, string>)) {
      const cssValue =
        typeof value === 'string' && value.startsWith('$')
          ? `var(--flux-${category}-${value.slice(1)})`
          : value
      lines.push(`  --flux-${category}-${key}: ${cssValue};`)
    }
  }

  lines.push('}')
  return lines.join('\n')
}

const css = readFileSync(CSS_FILE, 'utf8')
const startIdx = css.indexOf(START)
const endIdx = css.indexOf(END)

if (startIdx === -1 || endIdx === -1) {
  console.error(`Missing markers in flux.core.css:\n  ${START}\n  ${END}`)
  process.exit(1)
}

const generated = `${START}\n\n${generateVarsBlock()}\n\n${END}`
const newCss = css.slice(0, startIdx) + generated + css.slice(endIdx + END.length)
writeFileSync(CSS_FILE, newCss)
console.log('✓ flux.core.css theme vars generated from theme.ts')
