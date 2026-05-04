/** @jsxImportSource @madenowhere/phaze */
import { Plugins } from '../../plugin'
import { warn, FluxErrors } from '../../utils/log'
import { setCurrentInput, useStoreContext } from '../../context'
import { useInputSetters } from '../../hooks'
import { StyledInputWrapper } from '../UI/StyledUI'
import type { DataInput } from '../../types'

type ControlInputProps = Omit<DataInput, '__refCount' | 'key'> & {
  valueKey: string
  path: string
  storeId: string
  setValue: (value: any) => void
  setSettings: (settings: any) => void
  disable: (flag: boolean) => void
  emitOnEditStart?: (...args: any) => void
  emitOnEditEnd?: (...args: any) => void
}

export function ControlInput({
  type,
  label,
  path,
  valueKey,
  value,
  settings,
  setValue,
  disabled,
  ...rest
}: ControlInputProps) {
  // Reactive read of the live value at this path. Threaded into
  // useInputSetters so the displayValue mirror tracks store updates
  // (drag, programmatic set, hot-reload). Without this, displayValue
  // captures `value` at mount and never refreshes — visible as a stuck
  // scrubber during slider drag.
  const store = useStoreContext()
  const valueGetter = () => (store.state.data[path] as DataInput | undefined)?.value
  const { displayValue, onChange, onUpdate } = useInputSetters({ type, value, settings, setValue, valueGetter })

  const Input = Plugins[type].component
  if (!Input) {
    warn(FluxErrors.NO_COMPONENT_FOR_TYPE, type, path)
    return null
  }

  // Phaze migration (Pattern 6): no createContext/Provider in phaze. The
  // per-row input context is set synchronously via a module-level slot
  // immediately before rendering the plugin's component. Plugins read it
  // ONCE at the top of their function via useInputContext(); the captured
  // value is stable for the lifetime of the row because phaze components
  // run once at mount. Subsequent rows' setCurrentInput() calls don't
  // disturb already-captured values.
  setCurrentInput({
    key: valueKey,
    path,
    id: '' + path,
    label,
    displayValue,
    value,
    onChange,
    onUpdate,
    settings,
    setValue,
    disabled,
    ...rest,
  } as any)

  return (
    <StyledInputWrapper disabled={disabled}>
      {/* @ts-ignore */}
      <Input />
    </StyledInputWrapper>
  )
}
