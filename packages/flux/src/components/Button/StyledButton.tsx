import type { JSX, Ref } from 'preact'

type ButtonProps = Omit<JSX.IntrinsicElements['button'], 'ref'>

export function StyledButton({ innerRef, className = '', ...props }: ButtonProps & { innerRef?: Ref<HTMLButtonElement> }) {
  return <button ref={innerRef} class={`flux-button ${className}`.trim()} {...props} />
}
