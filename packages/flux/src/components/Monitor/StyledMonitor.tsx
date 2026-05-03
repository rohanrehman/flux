/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type CanvasProps = JSX.IntrinsicElements['canvas']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function Canvas({ innerRef, className = '', ...props }: CanvasProps & { innerRef?: RefLike<HTMLCanvasElement> }) {
  return <canvas ref={innerRef as any} class={`flux-monitor-canvas ${className}`.trim()} {...props} />
}
