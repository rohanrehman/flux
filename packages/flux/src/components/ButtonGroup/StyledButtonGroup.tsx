/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type DivProps = JSX.IntrinsicElements['div']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function StyledButtonGroup({ ref, className = '', ...props }: DivProps & { ref?: RefLike<HTMLDivElement> }) {
  return <div ref={ref as any} class={`flux-button-group ${className}`.trim()} {...props} />
}
