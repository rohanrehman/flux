/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type DivProps = JSX.IntrinsicElements['div']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function StyledInputWrapper({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-boolean-wrapper ${className}`.trim()} {...props} />
}
