/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'
import './styles/plugin-spring.css'

type CanvasProps = JSX.IntrinsicElements['canvas']
type DivProps = JSX.IntrinsicElements['div']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function Canvas({ innerRef, className = '', ...props }: CanvasProps & { innerRef?: RefLike<HTMLCanvasElement> }) {
  return <canvas ref={innerRef as any} class={`flux-spring-canvas ${className}`.trim()} {...props} />
}

export function SpringPreview({
  innerRef,
  ref,
  className = '',
  ...props
}: DivProps & { innerRef?: RefLike<HTMLDivElement>; ref?: RefLike<HTMLDivElement> }) {
  return <div ref={(innerRef ?? ref) as any} class={`flux-spring-preview ${className}`.trim()} {...props} />
}
