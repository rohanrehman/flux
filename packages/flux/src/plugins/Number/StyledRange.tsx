/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type DivProps = JSX.IntrinsicElements['div']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function Range({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-range ${className}`.trim()} {...props} />
}

export function Scrubber({ innerRef, position, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement>; position?: 'left' | 'right' }) {
  return (
    <div
      ref={innerRef as any}
      class={[
        'flux-scrubber',
        position === 'left' ? 'flux-scrubber--left' : '',
        position === 'right' ? 'flux-scrubber--right' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}

export function RangeWrapper({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-range-wrapper ${className}`.trim()} {...props} />
}

export function Indicator({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-indicator ${className}`.trim()} {...props} />
}
