import type { JSX, Ref } from 'preact'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>
type InputProps = Omit<JSX.IntrinsicElements['input'], 'ref'>

export function StyledInput({
  innerRef,
  fluxType,
  as: _as,
  className = '',
  ...props
}: InputProps & { innerRef?: Ref<HTMLInputElement>; fluxType?: string; as?: string }) {
  const classes = [
    'flux-input',
    fluxType === 'number' ? 'flux-input--number' : '',
    _as === 'textarea' ? 'flux-input--textarea' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <input ref={innerRef} class={classes} {...props} />
}

export function InnerLabel({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-inner-label ${className}`.trim()} {...props} />
}

export function InnerNumberLabel({
  innerRef,
  dragging,
  className = '',
  ...props
}: DivProps & { innerRef?: Ref<HTMLDivElement>; dragging?: boolean }) {
  return (
    <div
      ref={innerRef}
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
}: DivProps & { innerRef?: Ref<HTMLDivElement>; textArea?: boolean }) {
  return (
    <div
      ref={innerRef}
      class={`flux-input-container${textArea ? ' flux-input-container--textarea' : ''} ${className}`.trim()}
      {...props}
    />
  )
}
