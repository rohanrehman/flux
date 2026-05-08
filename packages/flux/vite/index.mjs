// vite-plugin-flux-shake — drop unused flux plugins from the consumer's
// bundle without forcing them to manually subpath-import each plugin.
//
// flux ships with all 9 input plugins eagerly registered at the entry's
// top level (Number, Boolean, String, Select, Color, Image, Interval,
// Vector, Vector2d, Vector3d). Rollup can't tree-shake them because the
// `register()` calls are side-effecting. Half of them ship in every
// consumer's bundle even though the typical app uses 4-5.
//
// This plugin runs at the consumer's vite/rollup build, scans the user's
// source files for schema fingerprints (e.g. a hex string implies COLOR,
// an `options:` field implies SELECT), and rewrites the bundled
// `flux/dist/index.js` entry to remove `register(...)` calls + their
// matching imports for plugins not detected. Rollup's downstream
// tree-shake (since flux is `sideEffects: false` for JS) then drops
// the orphaned plugin component code from the chunks too.
//
// Usage in the consumer's vite config:
//   import { fluxShakePlugin } from '@rohanrehman/flux/vite'
//   export default defineConfig({
//     plugins: [fluxShakePlugin()],
//   })
//
// To force-keep plugins despite no detection match (e.g. dynamic
// schemas that the regex heuristics can't see):
//   fluxShakePlugin({ keep: ['IMAGE', 'INTERVAL'] })

import fs from 'node:fs'

// Plugin types in flux's `FluxInputs` enum + the lowercase identifier
// flux's src/index.ts binds when importing the default export of each
// plugin module. The shake operates on the TypeScript source — Vite
// resolves `@rohanrehman/flux` to its `src/index.ts` (the package's
// `exports['.'].types` entry) when the workspace is reachable, so the
// register calls live there in plain `register(FluxInputs.X, ident)`
// shape (no minification, no bundling rename).
const PLUGINS = [
  { name: 'NUMBER',   ident: 'number'   },
  { name: 'BOOLEAN',  ident: 'boolean'  },
  { name: 'STRING',   ident: 'string'   },
  { name: 'SELECT',   ident: 'select'   },
  { name: 'COLOR',    ident: 'color'    },
  { name: 'IMAGE',    ident: 'image'    },
  { name: 'INTERVAL', ident: 'interval' },
  { name: 'VECTOR',   ident: 'vector'   },
  { name: 'VECTOR2D', ident: 'vector2d' },
  { name: 'VECTOR3D', ident: 'vector3d' },
]

// These are common enough that detecting them with regex is unreliable
// (every flux schema declares `value:` of some kind, plain numbers /
// booleans / strings can be hard to distinguish). Cheap to keep — leave
// them in unconditionally.
const ALWAYS_KEEP = new Set(['NUMBER', 'BOOLEAN', 'STRING'])

// Regex fingerprints per plugin. Conservative: false-positive (keep a
// plugin we don't strictly need) is cheaper than false-negative (drop a
// plugin the user actually uses → runtime "no component for type" error).
//
// Match patterns are anchored by a non-identifier boundary on the left so
// `vectorOps:` doesn't trigger VECTOR, `interval2:` doesn't trigger
// INTERVAL, etc.
const DETECT = {
  SELECT:   /(?<![A-Za-z0-9_])options\s*:/,
  COLOR:    /['"]#[0-9a-fA-F]{3,8}['"]/,
  IMAGE:    /(?<![A-Za-z0-9_])image\s*:|['"]data:image\//,
  INTERVAL: /(?<![A-Za-z0-9_])interval\s*:/,
  VECTOR:   /(?<![A-Za-z0-9_])vector\s*:/,
  VECTOR2D: /(?<![A-Za-z0-9_])vector2d\s*:|(?<![A-Za-z0-9_])joystick\s*:/,
  VECTOR3D: /(?<![A-Za-z0-9_])vector3d\s*:/,
}

// Strip a single `register(FluxInputs.NAME, ident)` call (with
// optional trailing semicolon / newline) so the entry no longer
// references `ident`.
function stripRegisterCall(src, name) {
  const re = new RegExp(
    `\\bregister\\(\\s*FluxInputs\\.${name}\\s*,[^)]*\\)\\s*;?\\s*\\n?`,
    'g',
  )
  return src.replace(re, '')
}

// Strip the default-import line for a plugin (`import ident from './plugins/Name'`).
// Once the corresponding register call is gone, this import has no
// remaining reference and Vite/Rollup's tree-shake can drop the
// underlying plugin module from the bundle entirely.
function stripDefaultImport(src, ident) {
  return src.replace(
    new RegExp(`^\\s*import\\s+${ident}\\s+from\\s+['"][^'"]+['"]\\s*;?\\s*\\n`, 'm'),
    '',
  )
}

// Recursively walk the project's `src/` looking for files that match
// any of the DETECT regexes. We pre-scan in buildStart (rather than
// using `this.getModuleIds()` from the Rollup hook) because the
// transform hook fires DURING graph traversal — flux's index.js may be
// processed before the consumer's source files have all been loaded
// into the graph, so `getModuleIds()` would return an incomplete set.
// fs walk is independent of build state.
function walk(dir, sink) {
  let entries
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'dist') continue
    const full = `${dir}/${e.name}`
    if (e.isDirectory()) walk(full, sink)
    else if (/\.(?:tsx?|jsx?|astro|svelte|vue)$/.test(e.name)) sink.push(full)
  }
}

function discoverUsed(rootDirs, keepExtra) {
  const used = new Set(ALWAYS_KEEP)
  for (const k of keepExtra) used.add(k)
  const files = []
  for (const root of rootDirs) walk(root, files)
  for (const file of files) {
    let src
    try { src = fs.readFileSync(file, 'utf8') } catch { continue }
    for (const [plugin, regex] of Object.entries(DETECT)) {
      if (used.has(plugin)) continue
      if (regex.test(src)) used.add(plugin)
    }
    // Early exit if everything's already on (no point scanning further).
    if (used.size === PLUGINS.length) break
  }
  return used
}

/** @returns {import('vite').Plugin} */
export function fluxShakePlugin(opts = {}) {
  const keepExtra = new Set(opts.keep || [])
  // `roots` is a list of directories to fs-walk for plugin fingerprints.
  // Defaults to `<cwd>/src` which covers a typical Astro/Vite project.
  // Override for repos with non-standard layouts.
  const roots = opts.roots || [`${process.cwd()}/src`]
  let cachedUsed = null

  return {
    name: 'flux-shake',
    apply: 'build',
    enforce: 'post',

    buildStart() {
      // Reset between dev-mode rebuilds.
      cachedUsed = null
    },

    // Operate on the unbundled module via the `transform` hook. Vite
    // resolves `@rohanrehman/flux` to its TS source (`packages/flux/src/
    // index.ts`) when the workspace is reachable, OR to the published
    // bundled entry (`@rohanrehman/flux/dist/index.js`) otherwise. Both
    // forms have plain `register(...)` calls with stable identifiers
    // before Rollup runs its rename pass — that's the only window where
    // we can match them with regex.
    transform(code, id) {
      const isFluxEntry =
        /[/\\]flux[/\\]src[/\\]index\.ts$/.test(id) ||
        /[/\\]flux[/\\]dist[/\\]index\.js$/.test(id)
      if (!isFluxEntry) return null
      if (!/\bregister\s*\(/.test(code)) return null

      if (cachedUsed === null) {
        cachedUsed = discoverUsed(roots, keepExtra)
        const dropped = PLUGINS
          .map(p => p.name)
          .filter(n => !cachedUsed.has(n))
        console.log(
          `[flux-shake] used plugins: ${[...cachedUsed].sort().join(', ')}`
          + (dropped.length ? ` (stripping: ${dropped.sort().join(', ')})` : '')
        )
      }

      let out = code
      let stripped = false
      for (const { name, ident } of PLUGINS) {
        if (cachedUsed.has(name)) continue
        // Drop the `register(FluxInputs.X, ident)` call so the default
        // import becomes orphan; then drop the import line itself. After
        // both, Vite/Rollup's tree-shake can drop the corresponding
        // plugin module from the bundle (flux is `sideEffects: false`
        // for JS so the cascade works).
        const before = out.length
        out = stripRegisterCall(out, name)
        out = stripDefaultImport(out, ident)
        if (out.length !== before) stripped = true
      }
      if (!stripped) return null
      return { code: out, map: null }
    },
  }
}
