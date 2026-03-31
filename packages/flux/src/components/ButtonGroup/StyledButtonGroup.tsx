import type { JSX, Ref } from 'preact'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>

export function StyledButtonGroup({ ref, className = '', ...props }: DivProps & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} class={`flux-button-group ${className}`.trim()} {...props} />
}
