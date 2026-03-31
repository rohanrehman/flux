import type { JSX, Ref } from 'preact'
import './styles/plugin-dates.css'

type InputProps = JSX.HTMLAttributes<HTMLInputElement>
type DivProps = JSX.HTMLAttributes<HTMLDivElement>

export function StyledInput({ innerRef, className = '', ...props }: InputProps & { innerRef?: Ref<HTMLInputElement> }) {
  return <input ref={innerRef} class={`flux-dates-input ${className}`.trim()} {...props} />
}

export function InputContainer({
  innerRef,
  textArea,
  className = '',
  ...props
}: DivProps & { innerRef?: Ref<HTMLDivElement>; textArea?: boolean }) {
  return (
    <div
      ref={innerRef}
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

export function StyledWrapper({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-dates-wrapper ${className}`.trim()} {...props} />
}
