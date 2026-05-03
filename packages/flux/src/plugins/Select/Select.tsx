/** @jsxImportSource @madenowhere/phaze */
import { useInputContext } from '../../context'
import { Label, Row, Chevron } from '../../components/UI'
import { NativeSelect, PresentationalSelect, SelectContainer } from './StyledSelect'
import type { SelectProps } from './select-types'

export function Select({
  displayValue,
  value,
  onUpdate,
  id,
  settings,
  disabled,
}: Pick<SelectProps, 'value' | 'displayValue' | 'onUpdate' | 'id' | 'settings' | 'disabled'>) {
  const { keys, values } = settings
  // Plain mutable local — phaze components run once so this persists for
  // the row's lifetime (Pattern 5).
  let lastDisplayedValue: any

  // in case the value isn't present in values (possibly when changing options
  // via deps), remember the last correct display value.
  if (value === values[displayValue]) {
    lastDisplayedValue = keys[displayValue]
  }

  return (
    <SelectContainer>
      <NativeSelect
        id={id}
        value={displayValue}
        onChange={(e: Event) =>
          onUpdate(values[Number((e.currentTarget as HTMLSelectElement).value)])
        }
        disabled={disabled}>
        {keys.map((key: string, index: number) => (
          <option key={key} value={index}>
            {key}
          </option>
        ))}
      </NativeSelect>
      <PresentationalSelect>{lastDisplayedValue}</PresentationalSelect>
      <Chevron toggled />
    </SelectContainer>
  )
}

export function SelectComponent() {
  const { label, value, displayValue, onUpdate, id, disabled, settings } = useInputContext<SelectProps>()
  return (
    <Row input>
      <Label>{label}</Label>
      <Select
        id={id}
        value={value}
        displayValue={displayValue}
        onUpdate={onUpdate}
        settings={settings}
        disabled={disabled}
      />
    </Row>
  )
}
