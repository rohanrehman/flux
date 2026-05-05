/**
 * Convenience hooks for building custom UIs with Flux headless.
 *
 * These functions return phaze `Computed<T>` accessors. Read them via
 * `result()` inside JSX or an effect/computed to subscribe.
 */

import { computed, untrack, type Computed } from '@madenowhere/phaze'
import { fluxStore } from '../store'
import { useVisiblePaths } from '../hooks/useVisiblePaths'
import { buildTree } from '../components/Flux/tree'
import { controlAccessor, type ControlAccessor } from '../control-accessor'
import type { StoreType, DataInput, Tree, Data, DataItem } from '../types/internal'

// Input type without the internal __refCount property
type Input = Omit<DataItem, '__refCount'>

// Mirrors hooks/useInput.ts: untrack the spread so the calling computed
// only tracks `data[path]` existence, not every property. Otherwise every
// drag tick re-fires this through any consumer reading inside a reactive
// scope, cascading remounts up the tree.
const getInputAtPath = (data: Data, path: string): Input | null => {
  if (!data[path]) return null
  return untrack(() => {
    const { __refCount, ...input } = data[path]
    return input
  })
}

/**
 * Reactive accessor for all visible inputs with their full metadata.
 * Useful for rendering a flat list of controls.
 *
 * @example
 * ```tsx
 * const inputs = useFluxInputs()
 * effect(() => {
 *   for (const { path, input } of inputs()) console.log(path, input.value)
 * })
 * ```
 */
export function useFluxInputs(
  store: StoreType = fluxStore
): Computed<{ path: string; input: DataInput }[]> {
  const paths = useVisiblePaths(store)
  return computed(() => {
    const data = store.state.data
    return paths().map((path) => ({ path, input: data[path] as DataInput }))
  })
}

/**
 * Reactive accessor for the folder tree structure of all visible inputs.
 * Useful for rendering hierarchical/folder-based UIs.
 */
export function useFluxTree(
  store: StoreType = fluxStore,
  filter?: string
): Computed<Tree> {
  const paths = useVisiblePaths(store)
  return computed(() => buildTree(paths(), filter))
}

/**
 * Phaze-Signal-shaped accessor for one input's value, by full dotted path.
 *
 * Same shape both fabric (`subscribeToSignals` duck-types on
 * `.set + .subscribe`) and photon (`animate` target detection) accept,
 * so `useFluxValue('Camera.fov')` is droppable directly into either:
 *
 *   const fov = useFluxValue<number>('Camera.fov')
 *   <Camera fov={fov} />
 *   animate(fov, 90, { stiffness: 100, damping: 30 })
 */
export function useFluxValue<T = unknown>(path: string, store: StoreType = fluxStore): ControlAccessor<T> {
  return controlAccessor<T>(store, path)
}

/**
 * Reactive accessor bag for a specific input. The outer Computed only
 * fires on path-level changes (input added/removed) — destructuring
 * `data[path]` directly would re-fire per property and tear down any
 * custom UI rendered inside a consumer thunk on every keystroke.
 *
 * Per-property reactivity is exposed via signal-shaped accessors on the
 * bag (`value`, `settings`, `disabled`) so consumers can bind just the
 * piece they need:
 *
 *   const handle = useFluxInput("count")
 *   <input
 *     type="range"
 *     value={handle()?.value as any}    // signal → reactive JSX binding
 *     onChange={(e) => handle()?.set(parseFloat(e.target.value))}
 *   />
 *   <span>{() => handle()?.value()}</span>
 */
export function useFluxInput(path: string, store: StoreType = fluxStore) {
  const set = (value: any) => store.setValueAtPath(path, value, true)
  const setSettings = (settings: any) => store.setSettingsAtPath(path, settings)
  const disable = (flag: boolean) => store.disableInputAtPath(path, flag)
  const emitOnEditStart = () => store.emitOnEditStart(path)
  const emitOnEditEnd = () => store.emitOnEditEnd(path)

  // Pre-built per-property accessors — stable identity across the bag's
  // lifetime. The outer computed only re-fires when the input itself
  // appears/disappears (data[path] existence read in getInputAtPath).
  const valueAccessor = controlAccessor(store, path)
  const settingsAccessor = computed(() => (store.state.data[path] as DataInput | undefined)?.settings)
  const disabledAccessor = computed(() => (store.state.data[path] as DataInput | undefined)?.disabled)

  return computed(() => {
    const input = getInputAtPath(store.state.data, path)
    if (!input) return null
    return {
      path,
      input,                       // static metadata snapshot (type, label, key, …)
      value: valueAccessor,        // reactive: callable + .set + .subscribe
      settings: settingsAccessor,  // reactive Computed of the settings object
      disabled: disabledAccessor,  // reactive Computed<boolean>
      set,
      setSettings,
      disable,
      emitOnEditStart,
      emitOnEditEnd,
      storeId: store.storeId,
    }
  })
}
