/** @jsxImportSource @madenowhere/phaze */
// glb — auto-detecting GLB animation source for flux schemas.
// ─────────────────────────────────────────────────────────────────────────────
// `glb({ url })` is a synchronous helper (mirrors `folder({...})`'s shape)
// that returns a flux folder containing one custom input: an `animation`
// SELECT auto-populated with the GLB's clip names. The fetch + JSON
// header parse happens INSIDE the input's component on mount, so the
// schema entry stays sync — no top-level await at the call site:
//
//   import { useFlux, glb } from '@rohanrehman/flux'
//
//   useFlux({
//     'Mesh Animation': glb({ url: '/3D/robot.glb' }),
//   })
//
//   <Mesh autoPlay={flux.animation} url="/3D/robot.glb" ... />
//
// `Mesh` (the consumer) must accept a function-form `autoPlay` so that
// the SELECT value is read each tick — the plugin doesn't ship a remount
// wrapper. Mesh.tsx already does this; renderers that don't would need
// either a wrapper or their own reactive plumbing.
//
// Caveat: the SELECT key (`animation`) flattens into flux's top-level
// accessor namespace — multiple `glb({...})` calls in one schema collide
// on `flux.animation`. Single-instance for now.

import { signal, effect, cleanup } from '@madenowhere/phaze'
import { createPlugin } from '../plugin'
import { useInputContext } from '../context'
import { Row } from '../components/UI/Row'
import { Label } from '../components/UI/Label'
import { folder } from '../helpers/folder'

export type GlbAnim = { name: string; duration: number }

// GLB binary layout (glTF 2.0 spec):
//   bytes  0..3 : magic 'glTF'  (0x46546C67 LE)
//   bytes  4..7 : version (always 2)
//   bytes  8..11: total file length
//   chunk header: [u32 length][u32 type] then [length] bytes of data
//   first chunk MUST be JSON (type 0x4E4F534A 'JSON')
async function parseGlbAnimations(url: string): Promise<GlbAnim[]> {
  const buf = await fetch(url).then(r => r.arrayBuffer())
  const dv  = new DataView(buf)
  if (dv.getUint32(0, true) !== 0x46546C67) throw new Error(`Not a GLB: ${url}`)
  const jsonLen  = dv.getUint32(12, true)
  const jsonType = dv.getUint32(16, true)
  if (jsonType !== 0x4E4F534A) throw new Error(`First chunk not JSON: ${url}`)
  const jsonBytes = new Uint8Array(buf, 20, jsonLen)
  const gltf      = JSON.parse(new TextDecoder().decode(jsonBytes))
  if (!Array.isArray(gltf.animations)) return []
  return gltf.animations.map((anim: any, i: number) => {
    let maxTime = 0
    for (const sampler of anim.samplers ?? []) {
      const acc = gltf.accessors?.[sampler.input]
      const t   = Array.isArray(acc?.max) ? acc.max[0] : 0
      if (t > maxTime) maxTime = t
    }
    return { name: anim.name ?? `anim_${i}`, duration: maxTime || 1 }
  })
}

// Per-URL fetch + parse cache shared across all instances of the input
// (panel re-mount, multiple meshes pointing at the same GLB, etc.).
const animsCache = new Map<string, Promise<GlbAnim[]>>()
function getAnims(url: string): Promise<GlbAnim[]> {
  if (typeof window === 'undefined') return Promise.resolve([])
  if (!animsCache.has(url)) animsCache.set(url, parseGlbAnimations(url))
  return animsCache.get(url)!
}

// Custom input — renders a native <select> with options populated from
// the GLB header on mount. We don't reuse flux's built-in Select component
// because its `keys`/`values` settings are fixed at normalize time, and
// our options arrive asynchronously.
function GlbSelectComponent() {
  const { label, value, onUpdate, id, settings, disabled } = useInputContext<{
    settings: { url: string }
    [k: string]: any
  }>()

  const animsSig = signal<GlbAnim[]>([])

  effect(() => {
    let alive = true
    getAnims(settings.url).then((anims) => {
      if (alive) animsSig.set(anims)
    })
    cleanup(() => { alive = false })
  })

  return (
    <Row input>
      <Label>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e: any) => onUpdate(e.currentTarget.value)}
        disabled={disabled}
        style={{ flex: '1', minWidth: '0' }}
      >
        <option value="">Off</option>
        {() => animsSig().map(a => (
          <option key={a.name} value={a.name}>{a.name}</option>
        ))}
      </select>
    </Row>
  )
}

// createPlugin returns a callable that produces a tagged input descriptor.
// The plugin module's `register` slot couples the descriptor's auto-
// generated type to the component above; flux dispatches on it at render
// time.
const glbInput = createPlugin<{ url: string; value?: string }, string, { url: string }>({
  normalize: (input) => ({
    value: input?.value ?? '',
    settings: { url: input!.url },
  }),
  sanitize: (v: any) => v ?? '',
  component: GlbSelectComponent,
})

// Public helper. Mirrors `folder({...})`'s call shape so the schema
// reads naturally:  `'Mesh Animation': glb({ url: '/3D/robot.glb' })`.
export function glb(opts: { url: string }) {
  return folder({
    animation: glbInput({ url: opts.url }),
  }, { collapsed: false })
}

// Companion helper: clip-name → duration in seconds. Exposed for callers
// that want their own timeline mirror; shares the parse cache.
glb.durations = async (url: string): Promise<Record<string, number>> => {
  const anims = await getAnims(url)
  const m: Record<string, number> = {}
  for (const a of anims) m[a.name] = a.duration
  return m
}
