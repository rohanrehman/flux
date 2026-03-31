import type { JSX } from 'preact'

export function Chevron({ toggled, className = '', ...props }: JSX.SVGAttributes<SVGSVGElement> & { toggled?: boolean }) {
  return (
    <svg
      width="9"
      height="5"
      viewBox="0 0 9 5"
      xmlns="http://www.w3.org/2000/svg"
      class={`flux-chevron ${className}`.trim()}
      style={{ transform: `rotate(${toggled ? 0 : -90}deg)` }}
      {...props}>
      <path d="M3.8 4.4c.4.3 1 .3 1.4 0L8 1.7A1 1 0 007.4 0H1.6a1 1 0 00-.7 1.7l3 2.7z" />
    </svg>
  )
}
