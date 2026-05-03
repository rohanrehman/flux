/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type ButtonProps = JSX.IntrinsicElements['button']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function StyledButtonGroupButton({
  ref,
  className = '',
  ...props
}: ButtonProps & { ref?: RefLike<HTMLButtonElement> }) {
  return <button ref={ref as any} class={`flux-button-group-button ${className}`.trim()} {...props} />
}
