/**
 * Module-level `flux` proxy — always importable, always safe to call.
 *
 * The default export `flux` is bound to `fluxStore`. `useControls(...)`
 * registers schema keys into the store as a side effect, after which
 * `flux.<key>` resolves to a ControlAccessor for that input. Without a
 * preceding `useControls` call, `flux.<key>` returns `undefined` and
 * `flux.merge(...)` falls through to the plain `{...defaults, ...override}`
 * spread — so commenting out the `useControls(...)` line in your component
 * leaves the rest of the file working with no edits.
 *
 * For multi-panel apps with their own `createStore()` instance, call
 * `createFluxAPI(store)` to get a panel-scoped equivalent.
 *
 * ## Typical usage
 *
 *     import { flux, useControls, folder, Flux } from '@rohanrehman/flux'
 *
 *     // Optional — registers schema; flux.fov etc. become live signals.
 *     useControls({
 *       Camera: folder({ fov: { value: 60, min: 10, max: 150 } }),
 *     })
 *
 *     // Always works — ControlAccessor when registered, plain default
 *     // when not.
 *     const activeCamera = flux.merge(DEFAULT_CAMERA, camera)
 *
 *     return <>
 *       <Camera {...activeCamera} />
 *       <Flux />
 *     </>
 *
 * Comment the `useControls` call + `<Flux />` JSX and the rest stays put.
 */

import { fluxStore } from './store'
import { controlAccessor, type ControlAccessor } from './control-accessor'
import type { StoreType } from './types/internal'

export interface FluxAPI {
  /**
   * Merge `defaults` and `override` (caller-supplied), then upgrade keys
   * present in the schema registry to live ControlAccessor signals. The
   * fabric components downstream (Camera/Grid/Scene/Mesh) detect the
   * `.set + .subscribe` shape and wire up live updates.
   *
   * Without a preceding `useControls(...)` call: returns the plain
   * spread of `defaults` and `override`. Drop-in safe.
   */
  merge<T extends object>(defaults: T, override?: Partial<T>): T
  /**
   * Imperative bulk-set — same shape as the existing `setMany` on the
   * useControls return. Pass `{ key: value }`; flux resolves `key`
   * through the store's registry.
   */
  set(values: Record<string, unknown>): void
  /**
   * Imperative read — same shape as the existing `getOne`.
   */
  get(path: string): unknown
  /**
   * Per-key Proxy reads. `flux.fov` returns the ControlAccessor when the
   * key is registered, or `undefined` otherwise. The TS index signature
   * is intentionally permissive — schema-level type safety lives at the
   * `useControls` call site, where the schema is the source of truth.
   */
  [key: string]: unknown
}

/**
 * Create a panel-scoped FluxAPI bound to a specific store. Use this when
 * you have multiple panels (`createStore()`-backed) on the same page;
 * each gets its own flux proxy that reads from its own store registry.
 *
 * For single-panel apps (the typical case), the default `flux` export
 * below is bound to the global `fluxStore` and works without setup.
 */
export function createFluxAPI(store: StoreType = fluxStore): FluxAPI {
  // Per-store accessor cache — each path's ControlAccessor is memoized
  // so `flux.fov` returns the same identity across reads.
  const accessorCache = new Map<string, ControlAccessor<unknown>>()

  const getAcc = (key: string): ControlAccessor<unknown> | undefined => {
    const path = store.keyToPath[key]
    if (!path) return undefined
    let acc = accessorCache.get(path)
    if (!acc) {
      acc = controlAccessor(store, path) as ControlAccessor<unknown>
      accessorCache.set(path, acc)
    }
    return acc
  }

  const merge = <T extends object>(defaults: T, override?: Partial<T>): T => {
    const out: any = { ...defaults, ...(override ?? {}) }
    for (const key in defaults) {
      const acc = getAcc(key)
      if (acc) out[key] = acc
    }
    return out
  }

  const setMany = (values: Record<string, unknown>): void => {
    const fullPaths: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(values)) {
      const path = store.keyToPath[k]
      if (path) fullPaths[path] = v
    }
    store.set(fullPaths, true)
  }

  const getOne = (path: string): unknown => store.get(path)

  return new Proxy({} as FluxAPI, {
    get(_target, prop) {
      if (typeof prop === 'symbol') return undefined
      if (prop === 'merge') return merge
      if (prop === 'set') return setMany
      if (prop === 'get') return getOne
      return getAcc(prop as string)
    },
    set() { return false },  // immutable shape
    has(_target, prop) {
      if (typeof prop === 'symbol') return false
      if (prop === 'merge' || prop === 'set' || prop === 'get') return true
      return prop in store.keyToPath
    },
  })
}

/**
 * Default flux proxy bound to `fluxStore`. Always safe to import and
 * call; `flux.merge(defaults, override?)` works whether or not
 * `useControls(...)` has been invoked.
 */
export const flux: FluxAPI = createFluxAPI()
