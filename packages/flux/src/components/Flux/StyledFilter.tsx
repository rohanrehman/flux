/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type DivProps = JSX.IntrinsicElements['div']
type InputProps = JSX.IntrinsicElements['input']
type IProps = JSX.IntrinsicElements['i']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>
type Reactive<T> = T | (() => T)
const read = <T,>(v: Reactive<T>): T => (typeof v === 'function' ? (v as () => T)() : v)

export function Icon({
  ref,
  active,
  className = '',
  ...props
}: IProps & { ref?: RefLike<HTMLElement>; active?: Reactive<boolean | undefined> }) {
  return (
    <i
      ref={ref as any}
      class={() => `flux-filter-icon${read(active) ? ' flux-filter-icon--active' : ''} ${className}`.trim()}
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
}: DivProps & { ref?: RefLike<HTMLDivElement>; toggled?: Reactive<boolean | undefined> }) {
  return (
    <div
      ref={ref as any}
      class={() => `flux-filter-wrapper${read(toggled) ? ' flux-filter-wrapper--toggled' : ''} ${className}`.trim()}
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
