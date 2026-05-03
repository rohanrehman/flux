import { computed, type Computed } from '@madenowhere/phaze'
import { useStoreContext } from '../context'
import type { Data, DataItem } from '../types'

const getInputAtPath = (data: Data, path: string) => {
  if (!data[path]) return null
  const { __refCount, ...input } = data[path]
  return input
}

type Input = Omit<DataItem, '__refCount'>

/**
 * Returns a reactive accessor for the input at `path` plus imperative
 * setters. Read `input()` inside JSX or an effect/computed to subscribe;
 * the accessor re-fires whenever any property of the input proxy changes.
 *
 * @public - For plugin development
 *
 * Replaces the preact-era hook that returned a plain `Input | null` and
 * relied on `useState` + `store.useStore.subscribe(...)` to push updates.
 *
 * @returns `[inputSignal, methods]` — methods are stable for the
 *   component's lifetime; `inputSignal()` is the reactive read.
 */
export function useInput(path: string): [
  Computed<Input | null>,
  {
    set: (value: any) => void
    setSettings: (value: any) => void
    disable: (flag: boolean) => void
    storeId: string
    emitOnEditStart: () => void
    emitOnEditEnd: () => void
  }
] {
  const store = useStoreContext()

  const input = computed(() => getInputAtPath(store.state.data, path))

  return [
    input,
    {
      set: (value: any) => store.setValueAtPath(path, value, true),
      setSettings: (settings: any) => store.setSettingsAtPath(path, settings),
      disable: (flag: boolean) => store.disableInputAtPath(path, flag),
      storeId: store.storeId,
      emitOnEditStart: () => store.emitOnEditStart(path),
      emitOnEditEnd: () => store.emitOnEditEnd(path),
    },
  ]
}
