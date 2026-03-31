import type { JSX, Ref, ComponentChildren } from 'preact'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>
type InputProps = Omit<JSX.IntrinsicElements['input'], 'ref'>
type LabelProps = Omit<JSX.IntrinsicElements['label'], 'ref'>

export function StyledRow({ innerRef, disabled, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement>; disabled?: boolean }) {
  return <div ref={innerRef} class={`flux-row${disabled ? ' flux-row--disabled' : ''} ${className}`.trim()} {...props} />
}

export function StyledInputRow({ innerRef, disabled, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement>; disabled?: boolean }) {
  return <div ref={innerRef} class={`flux-row flux-input-row${disabled ? ' flux-row--disabled' : ''} ${className}`.trim()} {...props} />
}

export function CopyLabelContainer({ innerRef, align, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement>; align?: 'top' }) {
  return (
    <div
      ref={innerRef}
      class={`flux-copy-label-container${align === 'top' ? ' flux-copy-label-container--top' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function StyledOptionalToggle({ innerRef, className = '', ...props }: InputProps & { innerRef?: Ref<HTMLInputElement> }) {
  return <input ref={innerRef} class={`flux-optional-toggle ${className}`.trim()} {...props} />
}

export function StyledLabel({ innerRef, className = '', ...props }: LabelProps & { innerRef?: Ref<HTMLLabelElement> }) {
  return <label ref={innerRef} class={`flux-label ${className}`.trim()} {...props} />
}

export function StyledInputWrapper({ innerRef, disabled, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement>; disabled?: boolean }) {
  return (
    <div
      ref={innerRef}
      class={`flux-input-wrapper${disabled ? ' flux-input-wrapper--disabled' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function Overlay({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-overlay ${className}`.trim()} {...props} />
}

export function StyledToolTipContent({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-tooltip-content ${className}`.trim()} {...props} />
}

export function ToolTipArrow({ className = '' }: { className?: string }) {
  return <div class={`flux-tooltip-arrow ${className}`.trim()} />
}

export function Tooltip({ content, children }: { content: ComponentChildren; children: ComponentChildren }) {
  return (
    <span class="flux-tooltip-wrapper">
      {children}
      <span class="flux-tooltip-content">{content}</span>
    </span>
  )
}
