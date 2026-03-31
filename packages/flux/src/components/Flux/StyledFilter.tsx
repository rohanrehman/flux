import type { JSX, Ref } from 'preact'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>
type InputProps = Omit<JSX.IntrinsicElements['input'], 'ref'>

export function Icon({
  ref,
  active,
  className = '',
  ...props
}: JSX.HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement>; active?: boolean }) {
  return (
    <i
      ref={ref}
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
}: DivProps & { ref?: Ref<HTMLDivElement>; mode?: 'drag' }) {
  return (
    <div
      ref={ref}
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
}: DivProps & { ref?: Ref<HTMLDivElement>; toggled?: boolean }) {
  return (
    <div
      ref={ref}
      class={`flux-filter-wrapper${toggled ? ' flux-filter-wrapper--toggled' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function StyledFilterInput({ ref, className = '', ...props }: InputProps & { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} class={`flux-filter-input ${className}`.trim()} {...props} />
}

export function TitleContainer({
  ref,
  drag,
  filterEnabled = true,
  className = '',
  ...props
}: DivProps & { ref?: Ref<HTMLDivElement>; drag?: boolean; filterEnabled?: boolean }) {
  const classes = [
    'flux-title-container',
    drag ? 'flux-title-container--draggable' : '',
    !filterEnabled ? 'flux-title-container--no-filter' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <div ref={ref} class={classes} {...props} />
}
