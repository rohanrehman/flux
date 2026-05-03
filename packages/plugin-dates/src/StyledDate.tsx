/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'
import './styles/plugin-dates.css'

type InputProps = JSX.IntrinsicElements['input']
type DivProps = JSX.IntrinsicElements['div']
type ButtonProps = JSX.IntrinsicElements['button']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function StyledInput({ innerRef, className = '', ...props }: InputProps & { innerRef?: RefLike<HTMLInputElement> }) {
  return <input ref={innerRef as any} class={`flux-dates-input ${className}`.trim()} {...props} readOnly />
}

export function InputContainer({
  innerRef,
  textArea,
  className = '',
  ...props
}: DivProps & { innerRef?: RefLike<HTMLDivElement>; textArea?: boolean }) {
  return (
    <div
      ref={innerRef as any}
      class={[
        'flux-dates-input-container',
        textArea ? 'flux-dates-input-container--textarea' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}

export function StyledWrapper({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-dates-wrapper ${className}`.trim()} {...props} />
}

export function CalendarHeader({ className = '', ...props }: DivProps) {
  return <div class={`flux-dates-header ${className}`.trim()} {...props} />
}

export function CalendarGrid({ className = '', ...props }: DivProps) {
  return <div class={`flux-dates-grid ${className}`.trim()} {...props} />
}

export function NavButton({ className = '', ...props }: ButtonProps) {
  return <button type="button" class={`flux-dates-nav ${className}`.trim()} {...props} />
}

export function DayButton({
  className = '',
  selected,
  outside,
  ...props
}: ButtonProps & { selected?: boolean | (() => boolean); outside?: boolean }) {
  const isSelected = () => (typeof selected === 'function' ? selected() : selected)
  return (
    <button
      type="button"
      class={() =>
        [
          'flux-dates-day',
          isSelected() ? 'flux-dates-day--selected' : '',
          outside ? 'flux-dates-day--outside' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')
      }
      {...props}
    />
  )
}

export function DayName({ className = '', ...props }: DivProps) {
  return <div class={`flux-dates-day-name ${className}`.trim()} {...props} />
}
