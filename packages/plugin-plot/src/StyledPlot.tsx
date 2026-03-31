import type { JSX, Ref } from 'preact'
import './styles/plugin-plot.css'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>
type CanvasProps = JSX.HTMLAttributes<HTMLCanvasElement>

export function Wrapper({ ref, className = '', ...props }: DivProps & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} class={`flux-plot-wrapper ${className}`.trim()} {...props} />
}

export function ToolTip({ ref, className = '', ...props }: DivProps & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} class={`flux-plot-tooltip ${className}`.trim()} {...props} />
}

export function Canvas({ innerRef, className = '', ...props }: CanvasProps & { innerRef?: Ref<HTMLCanvasElement> }) {
  return <canvas ref={innerRef} class={`flux-plot-canvas ${className}`.trim()} {...props} />
}

export function Dot({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-plot-dot ${className}`.trim()} {...props} />
}

export function SyledInnerLabel({
  ref,
  graph,
  className = '',
  ...props
}: DivProps & { ref?: Ref<HTMLDivElement>; graph?: boolean }) {
  return (
    <div
      ref={ref}
      class={`flux-plot-inner-label${graph ? ' flux-plot-inner-label--graph' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function Container({ ref, className = '', ...props }: DivProps & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} class={`flux-plot-container ${className}`.trim()} {...props} />
}
