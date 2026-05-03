/**
 * Convenience hooks for building custom UIs with Flux headless.
 *
 * These functions return phaze `Computed<T>` accessors. Read them via
 * `result()` inside JSX or an effect/computed to subscribe.
 */

import { computed, type Computed } from '@madenowhere/phaze'
import { fluxStore } from '../store'
import { useVisiblePaths } from '../hooks/useVisiblePaths'
import { buildTree } from '../components/Flux/tree'
import type { StoreType, DataInput, Tree, Data, DataItem } from '../types/internal'

// Input type without the internal __refCount property
type Input = Omit<DataItem, '__refCount'>

const getInputAtPath = (data: Data, path: string): Input | null => {
  if (!data[path]) return null
  const { __refCount, ...input } = data[path]
  return input
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
 * Reactive accessor for a specific input plus imperative control methods.
 * Works without context — uses the store parameter directly.
 *
 * @returns A `Computed<T | null>` where T contains the input data and
 *   control methods, or `null` if the input doesn't exist.
 *
 * @example
 * ```tsx
 * const handle = useFluxInput("myFolder.count")
 * effect(() => {
 *   const h = handle()
 *   if (h) console.log(h.input.value, h.input.type)
 * })
 * ```
 */
export function useFluxInput(path: string, store: StoreType = fluxStore) {
  const set = (value: any) => store.setValueAtPath(path, value, true)
  const setSettings = (settings: any) => store.setSettingsAtPath(path, settings)
  const disable = (flag: boolean) => store.disableInputAtPath(path, flag)
  const emitOnEditStart = () => store.emitOnEditStart(path)
  const emitOnEditEnd = () => store.emitOnEditEnd(path)

  return computed(() => {
    const input = getInputAtPath(store.state.data, path)
    if (!input) return null
    return {
      path,
      input,
      set,
      setSettings,
      disable,
      emitOnEditStart,
      emitOnEditEnd,
      storeId: store.storeId,
    }
  })
}
