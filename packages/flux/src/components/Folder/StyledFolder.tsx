import type { JSX, Ref } from 'preact'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>

export function StyledFolder({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-folder ${className}`.trim()} {...props} />
}

export function StyledWrapper({
  innerRef,
  isRoot = false,
  flat = false,
  className = '',
  ...props
}: DivProps & { innerRef?: Ref<HTMLDivElement>; isRoot?: boolean; fill?: boolean; flat?: boolean }) {
  const classes = [
    'flux-folder-wrapper',
    isRoot ? 'flux-folder-wrapper--root' : 'flux-folder-wrapper--nested',
    isRoot && !flat ? 'flux-folder-wrapper--rounded' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <div ref={innerRef} class={classes} {...props} />
}

export function StyledTitle({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-folder-title ${className}`.trim()} {...props} />
}

export function StyledContent({
  innerRef,
  toggled = true,
  isRoot = false,
  className = '',
  ...props
}: DivProps & { innerRef?: Ref<HTMLDivElement>; toggled?: boolean; isRoot?: boolean }) {
  const classes = [
    'flux-folder-content',
    toggled ? 'flux-folder-content--open' : 'flux-folder-content--closed',
    isRoot ? 'flux-folder-content--root' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <div ref={innerRef} class={classes} {...props} />
}
