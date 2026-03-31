import type { JSX, Ref } from 'preact'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>
type SelectProps = Omit<JSX.IntrinsicElements['select'], 'ref'>

export function SelectContainer({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-select-container ${className}`.trim()} {...props} />
}

export function NativeSelect({ innerRef, className = '', ...props }: SelectProps & { innerRef?: Ref<HTMLSelectElement> }) {
  return <select ref={innerRef} class={`flux-native-select ${className}`.trim()} {...props} />
}

export function PresentationalSelect({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-presentational-select ${className}`.trim()} {...props} />
}
