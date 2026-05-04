import { computed, untrack, type Computed } from '@madenowhere/phaze'
import { useStoreContext } from '../context'
import type { Data, DataItem } from '../types'

// The spread `{ ...data[path] }` reads every property of the input proxy,
// subscribing the calling computed to all of them — value, fromPanel,
// settings, disabled, etc. Wrapping the spread in untrack() means we only
// track the existence of `data[path]` (the path's signal on the data
// proxy), not its contents. Consumers that need live property reactivity
// should subscribe to the specific signal they care about (e.g. via
// useValue() for `.value`, or read the property directly inside their
// own effect/computed). Without this, every drag tick re-fires the
// computed, returns a new object, and cascades remounts up through
// FluxCore's TreeWrapper thunk.
const getInputAtPath = (data: Data, path: string) => {
  if (!data[path]) return null
  return untrack(() => {
    const { __refCount, ...input } = data[path]
    return input
  })
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
