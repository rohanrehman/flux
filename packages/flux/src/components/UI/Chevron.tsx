/** @jsxImportSource @madenowhere/phaze */

type SvgProps = JSX.IntrinsicElements['svg']
type Reactive<T> = T | (() => T)

export function Chevron({ toggled, className = '', ...props }: SvgProps & { toggled?: Reactive<boolean | undefined>; className?: string }) {
  // style as thunk so the rotation tracks toggled() reactively when the
  // caller passes a Signal/Computed.
  const isToggled = () => (typeof toggled === 'function' ? (toggled as () => boolean | undefined)() : toggled)
  return (
    <svg
      width="9"
      height="5"
      viewBox="0 0 9 5"
      xmlns="http://www.w3.org/2000/svg"
      class={`flux-chevron ${className}`.trim()}
      style={() => ({ transform: `rotate(${isToggled() ? 0 : -90}deg)` })}
      {...props}>
      <path d="M3.8 4.4c.4.3 1 .3 1.4 0L8 1.7A1 1 0 007.4 0H1.6a1 1 0 00-.7 1.7l3 2.7z" />
    </svg>
  )
}
