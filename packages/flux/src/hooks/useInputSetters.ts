import { dequal } from 'dequal/lite'
import { signal, effect } from '@madenowhere/phaze'
import { format } from '../plugin'

type Props<V, Settings> = {
  type: string
  value: V
  settings?: Settings
  setValue: (v: V) => void
  /**
   * Reactive accessor for the live store value at this input's path.
   * Required for displayValue to track external changes (drag, programmatic
   * `store.set()`, hot-reload). When omitted, the hook falls back to the
   * snapshot `value` argument — display will only reflect the initial
   * mount value, which is wrong for any input the user can interact with.
   *
   * Wired by `ControlInput` from `useStoreContext().state.data[path].value`.
   */
  valueGetter?: () => V
}

/**
 * Manages display-vs-actual value separation, format sync, and the
 * temporary/committed change split for an input.
 *
 * Phaze migration: useState→signal for displayValue, useRef→plain locals
 * for previousValue/settings (Pattern 5). Mirror-effect tracks the
 * `valueGetter` thunk so display updates when the store changes — without
 * the thunk, the snapshot `value` argument is captured at mount time and
 * the effect never re-fires (preact-era code re-rendered with fresh `value`
 * each store update; phaze components run once so the equivalent has to
 * subscribe explicitly).
 */
export function useInputSetters<V, Settings extends object>({
  value,
  type,
  settings,
  setValue,
  valueGetter,
}: Props<V, Settings>) {
  const displayValue = signal(format(type, value, settings))
  let previousValue = value
  let currentSettings = settings

  const setFormat = (v: V) => displayValue.set(format(type, v, currentSettings))

  const onChange = (v: any) => displayValue.set(v)

  const onUpdate = (updatedValue: any) => {
    try {
      setValue(updatedValue)
    } catch (error: any) {
      const { type: errType, previousValue: prev } = error
      // make sure we throw an error if it's not a sanitization error
      if (errType !== 'FLUX_ERROR') throw error
      setFormat(prev)
    }
  }

  // Mirror external value updates into the display unless they originated
  // from this input. Tracking `valueGetter()` here is what makes the
  // displayValue reactive — every time the store writes to the input's
  // path (drag, programmatic set, etc.), this effect re-runs with the
  // fresh value and calls setFormat. dequal allows pass-through of complex
  // values like colors/objects without triggering on identity changes.
  effect(() => {
    currentSettings = settings
    const live = valueGetter ? valueGetter() : value
    if (!dequal(live, previousValue)) {
      setFormat(live)
      previousValue = live
    }
  })

  return { displayValue, onChange, onUpdate }
}
