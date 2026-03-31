import type { JSX, Ref } from 'preact'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>

export function RangeGrid({ innerRef, hasRange, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement>; hasRange?: boolean }) {
  return (
    <div
      ref={innerRef}
      class={`${hasRange ? 'flux-range-grid--has-range' : ''} ${className}`.trim() || undefined}
      {...props}
    />
  )
}
