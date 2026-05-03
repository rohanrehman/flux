/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type DivProps = JSX.IntrinsicElements['div']
type InputProps = JSX.IntrinsicElements['input']
type IProps = JSX.IntrinsicElements['i']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function Icon({
  ref,
  active,
  className = '',
  ...props
}: IProps & { ref?: RefLike<HTMLElement>; active?: boolean }) {
  return (
    <i
      ref={ref as any}
      class={`flux-filter-icon${active ? ' flux-filter-icon--active' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function StyledTitleWithFilter({
  ref,
  mode,
  className = '',
  ...props
}: DivProps & { ref?: RefLike<HTMLDivElement>; mode?: 'drag' }) {
  return (
    <div
      ref={ref as any}
      class={`flux-title-with-filter${mode === 'drag' ? ' flux-title-with-filter--drag' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function FilterWrapper({
  ref,
  toggled,
  className = '',
  ...props
}: DivProps & { ref?: RefLike<HTMLDivElement>; toggled?: boolean }) {
  return (
    <div
      ref={ref as any}
      class={`flux-filter-wrapper${toggled ? ' flux-filter-wrapper--toggled' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function StyledFilterInput({ ref, className = '', ...props }: InputProps & { ref?: RefLike<HTMLInputElement> }) {
  return <input ref={ref as any} class={`flux-filter-input ${className}`.trim()} {...props} />
}

export function TitleContainer({
  ref,
  drag,
  filterEnabled = true,
  className = '',
  ...props
}: DivProps & { ref?: RefLike<HTMLDivElement>; drag?: boolean; filterEnabled?: boolean }) {
  const classes = [
    'flux-title-container',
    drag ? 'flux-title-container--draggable' : '',
    !filterEnabled ? 'flux-title-container--no-filter' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <div ref={ref as any} class={classes} {...props} />
}
