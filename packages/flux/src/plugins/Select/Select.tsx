/** @jsxImportSource @madenowhere/phaze */
import { useInputContext } from '../../context'
import { Label, Row, Chevron } from '../../components/UI'
import { NativeSelect, PresentationalSelect, SelectContainer } from './StyledSelect'
import type { SelectProps } from './select-types'

export function Select({
  displayValue,
  onUpdate,
  id,
  settings,
  disabled,
}: Pick<SelectProps, 'value' | 'displayValue' | 'onUpdate' | 'id' | 'settings' | 'disabled'>) {
  const { keys, values } = settings
  // displayValue may be a phaze Signal/Computed (callable) or a plain
  // index — resolve defensively each read so both bindings update live.
  const readIndex = (): number =>
    typeof displayValue === 'function' ? (displayValue as () => number)() : (displayValue as number)

  return (
    <SelectContainer>
      <NativeSelect
        id={id}
        value={() => readIndex()}
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
      <PresentationalSelect>{() => keys[readIndex()]}</PresentationalSelect>
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
