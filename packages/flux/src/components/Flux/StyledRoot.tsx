import type { JSX, Ref } from 'preact'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>

export function StyledRoot({
  innerRef,
  fill = false,
  flat = false,
  glass = false,
  oneLineLabels = false,
  hideTitleBar = false,
  className = '',
  ...props
}: DivProps & { innerRef?: Ref<HTMLDivElement>; fill?: boolean; flat?: boolean; glass?: boolean; oneLineLabels?: boolean; hideTitleBar?: boolean }) {
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
  return <div ref={innerRef} class={classes} {...props} />
}
