/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type DivProps = JSX.IntrinsicElements['div']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function StyledFolder({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-folder ${className}`.trim()} {...props} />
}

export function StyledWrapper({
  innerRef,
  isRoot = false,
  flat = false,
  className = '',
  ...props
}: DivProps & { innerRef?: RefLike<HTMLDivElement>; isRoot?: boolean; fill?: boolean; flat?: boolean }) {
  const classes = [
    'flux-folder-wrapper',
    isRoot ? 'flux-folder-wrapper--root' : 'flux-folder-wrapper--nested',
    isRoot && !flat ? 'flux-folder-wrapper--rounded' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <div ref={innerRef as any} class={classes} {...props} />
}

export function StyledTitle({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-folder-title ${className}`.trim()} {...props} />
}

export function StyledContent({
  innerRef,
  toggled = true,
  isRoot = false,
  className = '',
  ...props
}: DivProps & { innerRef?: RefLike<HTMLDivElement>; toggled?: boolean | (() => boolean); isRoot?: boolean }) {
  // class as thunk so the open/closed modifier flips reactively.
  const isToggled = () => (typeof toggled === 'function' ? toggled() : toggled)
  return (
    <div
      ref={innerRef as any}
      class={() =>
        [
          'flux-folder-content',
          isToggled() ? 'flux-folder-content--open' : 'flux-folder-content--closed',
          isRoot ? 'flux-folder-content--root' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')
      }
      {...props}
    />
  )
}
