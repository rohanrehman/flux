/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type DivProps = JSX.IntrinsicElements['div']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function StyledRoot({
  innerRef,
  fill = false,
  flat = false,
  glass = false,
  oneLineLabels = false,
  hideTitleBar = false,
  className = '',
  ...props
}: DivProps & {
  innerRef?: RefLike<HTMLDivElement>
  fill?: boolean
  flat?: boolean
  glass?: boolean
  oneLineLabels?: boolean
  hideTitleBar?: boolean
}) {
  const classes = [
    'flux-root',
    fill ? 'flux-root--fill' : 'flux-root--fixed',
    !flat ? 'flux-root--rounded' : '',
    glass ? 'flux-root--glass' : '',
    oneLineLabels ? 'flux-root--one-line-labels' : '',
    hideTitleBar ? 'flux-root--hide-title-bar' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <div ref={innerRef as any} class={classes} {...props} />
}
