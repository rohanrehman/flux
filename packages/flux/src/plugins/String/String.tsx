/** @jsxImportSource @madenowhere/phaze */
import { ValueInput, ValueInputProps } from '../../components/ValueInput'
import { Label, Row } from '../../components/UI'
import { useInputContext } from '../../context'
import type { StringProps } from './string-types'

// The component is named `String` (matches the plugin's public API)
// which shadows the global String constructor inside this module.
// Alias here so coercions inside helpers resolve to the JS built-in.
const Str = globalThis.String

type BaseStringProps = Pick<StringProps, 'displayValue' | 'onUpdate' | 'onChange'> &
  Omit<ValueInputProps, 'value'> & { editable?: boolean }

// Resolve a displayValue that may be either a plain string or a
// callable Signal/Computed — phaze-migration plumbing.
const readDisplay = (v: unknown): string => {
  const x = typeof v === 'function' ? (v as () => unknown)() : v
  return Str(x ?? '')
}

export function String({ displayValue, onUpdate, onChange, editable = true, ...props }: BaseStringProps) {
  if (editable)
    return <ValueInput value={() => readDisplay(displayValue)} onUpdate={onUpdate} onChange={onChange} {...props} />
  return <div class="flux-non-editable-string">{() => readDisplay(displayValue)}</div>
}

export function StringComponent() {
  const { label, settings, displayValue, onUpdate, onChange } = useInputContext<StringProps>()
  return (
    <Row input>
      <Label>{label}</Label>
      <String displayValue={displayValue} onUpdate={onUpdate} onChange={onChange} {...settings} />
    </Row>
  )
}
