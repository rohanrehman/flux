/** @jsxImportSource @madenowhere/phaze */
import { signal, effect, cleanup } from '@madenowhere/phaze'
import { useInputContext } from '../../context'
import { parseNumber } from '../../utils'
import { StyledInput, InputContainer, InnerLabel } from './StyledInput'
import type { JSXChild } from '@madenowhere/phaze'

export type ValueInputProps = {
  id?: string
  // Phaze migration: value may be a plain string (back-compat) or a
  // thunk that returns the current display value. Thunks let phaze
  // track display-value signals through the chain so the input updates
  // reactively as the user scrubs.
  value: string | (() => string)
  innerLabel?: false | JSXChild
  type?: 'number'
  inputType?: string
  onUpdate: (value: any) => void
  onChange: (value: string) => void
  onKeyDown?: (event: KeyboardEvent) => void
  rows?: number
}

export function ValueInput({
  innerLabel,
  value,
  onUpdate,
  onChange,
  onKeyDown,
  type,
  id,
  inputType = 'text',
  rows = 0,
  ...props
}: ValueInputProps) {
  const { id: _id, emitOnEditStart, emitOnEditEnd, disabled } = useInputContext()
  const inputId = id || _id
  const inputRef = signal<HTMLInputElement>()

  const isTextArea = rows > 0
  const asType = isTextArea ? 'textarea' : 'input'

  const update =
    (fn: (value: string) => void) =>
    (event: any) => {
      const _value = event.currentTarget.value
      fn(_value)
    }

  /**
   * We need to add a native blur handler because of this React issue
   * where onBlur isn't called during unmount:
   * https://github.com/facebook/react/issues/12363
   */
  effect(() => {
    const ref = inputRef()
    if (!ref) return
    const _onUpdate = update((value) => {
      onUpdate(value)
      emitOnEditEnd()
    })
    ref.addEventListener('blur', _onUpdate)
    cleanup(() => ref.removeEventListener('blur', _onUpdate))
  })

  const onKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      update(onUpdate)(event)
    }
  }

  // It's a bit sad but we're passing the `as` prop here to avoid Typescript
  // complaining.
  const inputProps = Object.assign({ as: asType }, isTextArea ? { rows } : {}, props)

  return (
    <InputContainer textArea={isTextArea}>
      {innerLabel && typeof innerLabel === 'string' ? <InnerLabel>{innerLabel}</InnerLabel> : innerLabel}
      <StyledInput
        fluxType={type}
        innerRef={inputRef}
        id={inputId}
        type={inputType}
        autoComplete="off"
        spellcheck={false}
        value={value}
        onChange={update(onChange)}
        onFocus={() => emitOnEditStart()}
        onKeyPress={onKeyPress}
        onKeyDown={onKeyDown}
        disabled={disabled}
        {...inputProps}
      />
    </InputContainer>
  )
}

export function NumberInput({ onUpdate, ...props }: ValueInputProps) {
  const _onUpdate = (v: any) => onUpdate(parseNumber(v))
  const onKeyDown = (event: KeyboardEvent) => {
    const dir = event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0
    if (dir) {
      event.preventDefault()
      const step = event.altKey ? 0.1 : event.shiftKey ? 10 : 1
      onUpdate((v: any) => parseFloat(v) + dir * step)
    }
  }
  return <ValueInput {...props} onUpdate={_onUpdate} onKeyDown={onKeyDown} type="number" />
}
