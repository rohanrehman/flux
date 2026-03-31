import type { JSX, Ref } from 'preact'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>

export function ColorPreview({ innerRef, active, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement>; active?: boolean }) {
  return (
    <div
      ref={innerRef}
      class={`flux-color-preview${active ? ' flux-color-preview--active' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function PickerContainer({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-color-picker-container ${className}`.trim()} {...props} />
}

export function PickerWrapper({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-color-picker-wrapper ${className}`.trim()} {...props} />
}
