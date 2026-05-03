/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'
import './styles/plugin-plot.css'

type DivProps = JSX.IntrinsicElements['div']
type CanvasProps = JSX.IntrinsicElements['canvas']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function Wrapper({ ref, className = '', ...props }: DivProps & { ref?: RefLike<HTMLDivElement> }) {
  return <div ref={ref as any} class={`flux-plot-wrapper ${className}`.trim()} {...props} />
}

export function ToolTip({ ref, className = '', ...props }: DivProps & { ref?: RefLike<HTMLDivElement> }) {
  return <div ref={ref as any} class={`flux-plot-tooltip ${className}`.trim()} {...props} />
}

export function Canvas({ innerRef, className = '', ...props }: CanvasProps & { innerRef?: RefLike<HTMLCanvasElement> }) {
  return <canvas ref={innerRef as any} class={`flux-plot-canvas ${className}`.trim()} {...props} />
}

export function Dot({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-plot-dot ${className}`.trim()} {...props} />
}

export function SyledInnerLabel({
  ref,
  graph,
  className = '',
  ...props
}: DivProps & { ref?: RefLike<HTMLDivElement>; graph?: boolean | (() => boolean) }) {
  // class as thunk so the --graph modifier reflects toggle state reactively.
  const isGraph = () => (typeof graph === 'function' ? graph() : graph)
  return (
    <div
      ref={ref as any}
      class={() => `flux-plot-inner-label${isGraph() ? ' flux-plot-inner-label--graph' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function Container({ ref, className = '', ...props }: DivProps & { ref?: RefLike<HTMLDivElement> }) {
  return <div ref={ref as any} class={`flux-plot-container ${className}`.trim()} {...props} />
}
