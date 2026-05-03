/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type DivProps = JSX.IntrinsicElements['div']
type InputProps = JSX.IntrinsicElements['input']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function StyledInput({
  innerRef,
  fluxType,
  as: _as,
  className = '',
  ...props
}: InputProps & { innerRef?: RefLike<HTMLInputElement>; fluxType?: string; as?: string }) {
  const classes = [
    'flux-input',
    fluxType === 'number' ? 'flux-input--number' : '',
    _as === 'textarea' ? 'flux-input--textarea' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <input ref={innerRef as any} class={classes} {...props} />
}

export function InnerLabel({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-inner-label ${className}`.trim()} {...props} />
}

export function InnerNumberLabel({
  innerRef,
  dragging,
  className = '',
  ...props
}: DivProps & { innerRef?: RefLike<HTMLDivElement>; dragging?: boolean }) {
  return (
    <div
      ref={innerRef as any}
      class={`flux-inner-label flux-inner-number-label${dragging ? ' flux-inner-number-label--dragging' : ''} ${className}`.trim()}
      {...props}
    />
  )
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
      class={`flux-input-container${textArea ? ' flux-input-container--textarea' : ''} ${className}`.trim()}
      {...props}
    />
  )
}
