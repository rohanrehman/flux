import type { JSX, Ref } from 'preact'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>

export function Range({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-range ${className}`.trim()} {...props} />
}

export function Scrubber({ innerRef, position, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement>; position?: 'left' | 'right' }) {
  return (
    <div
      ref={innerRef}
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

export function RangeWrapper({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-range-wrapper ${className}`.trim()} {...props} />
}

export function Indicator({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-indicator ${className}`.trim()} {...props} />
}
