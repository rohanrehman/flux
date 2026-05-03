/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'
import './styles/plugin-bezier.css'

type DivProps = JSX.IntrinsicElements['div']
type SvgProps = JSX.IntrinsicElements['svg']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function Svg({
  innerRef,
  withPreview,
  className = '',
  ...props
}: SvgProps & { innerRef?: RefLike<SVGSVGElement>; withPreview?: boolean }) {
  return (
    <svg
      ref={innerRef as any}
      class={[
        'flux-bezier-svg',
        !withPreview ? 'flux-bezier-svg--no-preview' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}

export function PreviewSvg({ ref, className = '', ...props }: SvgProps & { ref?: RefLike<SVGSVGElement> }) {
  return <svg ref={ref as any} class={`flux-bezier-preview-svg ${className}`.trim()} {...props} />
}

export function SyledInnerLabel({
  ref,
  graph,
  className = '',
  ...props
}: DivProps & { ref?: RefLike<HTMLDivElement>; graph?: boolean | (() => boolean) }) {
  // class as thunk so the --graph modifier reflects toggle state.
  const isGraph = () => (typeof graph === 'function' ? graph() : graph)
  return (
    <div
      ref={ref as any}
      class={() => `flux-bezier-inner-label${isGraph() ? ' flux-bezier-inner-label--graph' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function Container({ ref, className = '', ...props }: DivProps & { ref?: RefLike<HTMLDivElement> }) {
  return <div ref={ref as any} class={`flux-bezier-container ${className}`.trim()} {...props} />
}
