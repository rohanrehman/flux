import type { JSX, Ref } from 'preact'

type CanvasProps = JSX.HTMLAttributes<HTMLCanvasElement>

export function Canvas({ innerRef, className = '', ...props }: CanvasProps & { innerRef?: Ref<HTMLCanvasElement | null> }) {
  return <canvas ref={innerRef} class={`flux-monitor-canvas ${className}`.trim()} {...props} />
}
