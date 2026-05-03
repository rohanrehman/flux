/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type DivProps = JSX.IntrinsicElements['div']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function ColorPreview({ innerRef, active, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement>; active?: boolean | (() => boolean) }) {
  // class as thunk so the --active modifier reflects shown() reactively.
  const isActive = () => (typeof active === 'function' ? active() : active)
  return (
    <div
      ref={innerRef as any}
      class={() => `flux-color-preview${isActive() ? ' flux-color-preview--active' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function PickerContainer({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-color-picker-container ${className}`.trim()} {...props} />
}

export function PickerWrapper({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-color-picker-wrapper ${className}`.trim()} {...props} />
}
