import type { JSX, Ref } from 'preact'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>

export function JoystickTrigger({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-joystick-trigger ${className}`.trim()} {...props} />
}

export function JoystickPlayground({ innerRef, isOutOfBounds, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement>; isOutOfBounds?: boolean }) {
  return (
    <div
      ref={innerRef}
      class={`flux-joystick-playground${isOutOfBounds ? ' flux-joystick-playground--out-of-bounds' : ''} ${className}`.trim()}
      {...props}
    />
  )
}
