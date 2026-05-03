/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type DivProps = JSX.IntrinsicElements['div']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function RangeGrid({ innerRef, hasRange, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement>; hasRange?: boolean }) {
  return (
    <div
      ref={innerRef as any}
      class={`${hasRange ? 'flux-range-grid--has-range' : ''} ${className}`.trim() || undefined}
      {...props}
    />
  )
}
