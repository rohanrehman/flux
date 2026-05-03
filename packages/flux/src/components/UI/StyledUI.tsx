/** @jsxImportSource @madenowhere/phaze */
import type { Signal, JSXChild } from '@madenowhere/phaze'

type DivProps = JSX.IntrinsicElements['div']
type InputProps = JSX.IntrinsicElements['input']
type LabelProps = JSX.IntrinsicElements['label']

// Phaze auto-wires Signal<T> as a ref via signal.set on mount. Wrappers
// accept that or any callback/object form.
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function StyledRow({
  innerRef,
  disabled,
  className = '',
  ...props
}: DivProps & { innerRef?: RefLike<HTMLDivElement>; disabled?: boolean }) {
  return <div ref={innerRef as any} class={`flux-row${disabled ? ' flux-row--disabled' : ''} ${className}`.trim()} {...props} />
}

export function StyledInputRow({
  innerRef,
  disabled,
  className = '',
  ...props
}: DivProps & { innerRef?: RefLike<HTMLDivElement>; disabled?: boolean }) {
  return <div ref={innerRef as any} class={`flux-row flux-input-row${disabled ? ' flux-row--disabled' : ''} ${className}`.trim()} {...props} />
}

export function CopyLabelContainer({
  innerRef,
  align,
  className = '',
  ...props
}: DivProps & { innerRef?: RefLike<HTMLDivElement>; align?: 'top' }) {
  return (
    <div
      ref={innerRef as any}
      class={`flux-copy-label-container${align === 'top' ? ' flux-copy-label-container--top' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function StyledOptionalToggle({
  innerRef,
  className = '',
  ...props
}: InputProps & { innerRef?: RefLike<HTMLInputElement> }) {
  return <input ref={innerRef as any} class={`flux-optional-toggle ${className}`.trim()} {...props} />
}

export function StyledLabel({
  innerRef,
  className = '',
  ...props
}: LabelProps & { innerRef?: RefLike<HTMLLabelElement> }) {
  return <label ref={innerRef as any} class={`flux-label ${className}`.trim()} {...props} />
}

export function StyledInputWrapper({
  innerRef,
  disabled,
  className = '',
  ...props
}: DivProps & { innerRef?: RefLike<HTMLDivElement>; disabled?: boolean }) {
  return (
    <div
      ref={innerRef as any}
      class={`flux-input-wrapper${disabled ? ' flux-input-wrapper--disabled' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function Overlay({
  innerRef,
  className = '',
  ...props
}: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-overlay ${className}`.trim()} {...props} />
}

export function StyledToolTipContent({
  innerRef,
  className = '',
  ...props
}: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-tooltip-content ${className}`.trim()} {...props} />
}

export function ToolTipArrow({ className = '' }: { className?: string }) {
  return <div class={`flux-tooltip-arrow ${className}`.trim()} />
}

export function Tooltip({ content, children }: { content: JSXChild; children: JSXChild }) {
  return (
    <span class="flux-tooltip-wrapper">
      {children}
      <span class="flux-tooltip-content">{content}</span>
    </span>
  )
}
