import type { JSX, Ref } from 'preact'
import './styles/plugin-bezier.css'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>
type SvgProps = JSX.SVGAttributes<SVGSVGElement>

export function Svg({
  innerRef,
  withPreview,
  className = '',
  ...props
}: SvgProps & { innerRef?: Ref<SVGSVGElement>; withPreview?: boolean }) {
  return (
    <svg
      ref={innerRef}
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

export function PreviewSvg({ ref, className = '', ...props }: SvgProps & { ref?: Ref<SVGSVGElement> }) {
  return <svg ref={ref} class={`flux-bezier-preview-svg ${className}`.trim()} {...props} />
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
      class={`flux-bezier-inner-label${graph ? ' flux-bezier-inner-label--graph' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function Container({ ref, className = '', ...props }: DivProps & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} class={`flux-bezier-container ${className}`.trim()} {...props} />
}
