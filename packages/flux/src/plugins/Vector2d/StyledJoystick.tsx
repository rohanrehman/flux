/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type DivProps = JSX.IntrinsicElements['div']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function JoystickTrigger({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-joystick-trigger ${className}`.trim()} {...props} />
}

export function JoystickPlayground({ innerRef, isOutOfBounds, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement>; isOutOfBounds?: boolean }) {
  return (
    <div
      ref={innerRef as any}
      class={`flux-joystick-playground${isOutOfBounds ? ' flux-joystick-playground--out-of-bounds' : ''} ${className}`.trim()}
      {...props}
    />
  )
}
