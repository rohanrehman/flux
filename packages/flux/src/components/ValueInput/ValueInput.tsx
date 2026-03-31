import { useCallback, useRef, useEffect } from 'preact/hooks'
import type { JSX } from 'preact'
import { useInputContext } from '../../context'
import { parseNumber } from '../../utils'
import { StyledInput, InputContainer, InnerLabel } from './StyledInput'
import type { ComponentChildren } from 'preact'

export type ValueInputProps = {
  id?: string
  value: string
  innerLabel?: false | ComponentChildren
  type?: 'number'
  inputType?: string
  onUpdate: (value: any) => void
  onChange: (value: string) => void
  onKeyDown?: (event: JSX.TargetedKeyboardEvent<HTMLInputElement>) => void
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
  const inputRef = useRef<HTMLInputElement>(null)

  const isTextArea = rows > 0
  const asType = isTextArea ? 'textarea' : 'input'

  const update = useCallback(
    (fn: (value: string) => void) => (event: any) => {
      const _value = event.currentTarget.value
      fn(_value)
    },
    []
  )

  /**
   * We need to add native blur handler because of this issue in React, where
   * the onBlur handler isn't called during unmount:
   * https://github.com/facebook/react/issues/12363
   */

  useEffect(() => {
    const ref = inputRef.current
    const _onUpdate = update((value) => {
      onUpdate(value)
      emitOnEditEnd()
    })
    ref?.addEventListener('blur', _onUpdate)
    return () => ref?.removeEventListener('blur', _onUpdate)
  }, [update, onUpdate, emitOnEditEnd])

  const onKeyPress = useCallback(
    (event: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        update(onUpdate)(event)
      }
    },
    [update, onUpdate]
  )

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
        spellCheck={false}
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
  const _onUpdate = useCallback((v: any) => onUpdate(parseNumber(v)), [onUpdate])
  const onKeyDown = useCallback(
    (event: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
      const dir = event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0
      if (dir) {
        event.preventDefault()
        const step = event.altKey ? 0.1 : event.shiftKey ? 10 : 1
        onUpdate((v: any) => parseFloat(v) + dir * step)
      }
    },
    [onUpdate]
  )
  return <ValueInput {...props} onUpdate={_onUpdate} onKeyDown={onKeyDown} type="number" />
}
