/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type DivProps = JSX.IntrinsicElements['div']
type SelectProps = JSX.IntrinsicElements['select']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function SelectContainer({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-select-container ${className}`.trim()} {...props} />
}

export function NativeSelect({ innerRef, className = '', ...props }: SelectProps & { innerRef?: RefLike<HTMLSelectElement> }) {
  return <select ref={innerRef as any} class={`flux-native-select ${className}`.trim()} {...props} />
}

export function PresentationalSelect({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-presentational-select ${className}`.trim()} {...props} />
}
