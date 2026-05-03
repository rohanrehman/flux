import { dequal } from 'dequal/lite'
import { signal, effect } from '@madenowhere/phaze'
import { format } from '../plugin'

type Props<V, Settings> = {
  type: string
  value: V
  settings?: Settings
  setValue: (v: V) => void
}

/**
 * Manages display-vs-actual value separation, format sync, and the
 * temporary/committed change split for an input.
 *
 * Phaze migration: useState→signal for displayValue, useRef→plain locals
 * for previousValue/settings (Pattern 5), useEffect→effect to keep the
 * display in sync with external value changes. Returns the displayValue
 * as a Computed accessor so consumers can pass it through reactively.
 */
export function useInputSetters<V, Settings extends object>({
  value,
  type,
  settings,
  setValue,
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
      if (errType !== 'LEVA_ERROR') throw error
      setFormat(prev)
    }
  }

  // Mirror external value updates into the display unless they originated
  // from this input. dequal allows pass-through of complex values like
  // colors/objects without triggering on identity changes.
  effect(() => {
    currentSettings = settings
    if (!dequal(value, previousValue)) {
      setFormat(value)
    }
    previousValue = value
  })

  return { displayValue, onChange, onUpdate }
}
