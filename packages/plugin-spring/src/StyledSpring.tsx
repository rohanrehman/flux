import type { JSX, Ref } from 'preact'
import './styles/plugin-spring.css'

type CanvasProps = JSX.HTMLAttributes<HTMLCanvasElement>
type DivProps = JSX.HTMLAttributes<HTMLDivElement>

export function Canvas({ innerRef, className = '', ...props }: CanvasProps & { innerRef?: Ref<HTMLCanvasElement> }) {
  return <canvas ref={innerRef} class={`flux-spring-canvas ${className}`.trim()} {...props} />
}

export function SpringPreview({ ref, className = '', ...props }: DivProps & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} class={`flux-spring-preview ${className}`.trim()} {...props} />
}
