import type { JSX, Ref } from 'preact'

type ButtonProps = JSX.HTMLAttributes<HTMLButtonElement>

export function StyledButtonGroupButton({
  ref,
  className = '',
  ...props
}: ButtonProps & { ref?: Ref<HTMLButtonElement> }) {
  return <button ref={ref} class={`flux-button-group-button ${className}`.trim()} {...props} />
}
