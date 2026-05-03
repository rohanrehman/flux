/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type ButtonProps = JSX.IntrinsicElements['button']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function StyledButton({ innerRef, className = '', ...props }: ButtonProps & { innerRef?: RefLike<HTMLButtonElement> }) {
  return <button ref={innerRef as any} class={`flux-button ${className}`.trim()} {...props} />
}
