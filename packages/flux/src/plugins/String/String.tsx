import { ValueInput, ValueInputProps } from '../../components/ValueInput'
import { Label, Row } from '../../components/UI'
import { useInputContext } from '../../context'
import type { StringProps } from './string-types'
type BaseStringProps = Pick<StringProps, 'displayValue' | 'onUpdate' | 'onChange'> &
  Omit<ValueInputProps, 'value'> & { editable?: boolean }

export function String({ displayValue, onUpdate, onChange, editable = true, ...props }: BaseStringProps) {
  if (editable) return <ValueInput value={displayValue} onUpdate={onUpdate} onChange={onChange} {...props} />
  return <div className="flux-non-editable-string">{displayValue}</div>
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
