import type { ComponentChildren } from 'preact'
import { createPortal } from 'preact/compat'
import { useContext } from 'preact/hooks'
import { ThemeContext } from '../../context'
export { Overlay } from './StyledUI'

export function Portal({ children, container = globalThis?.document?.body }: { children?: ComponentChildren; container?: Element | null }) {
  const { style } = useContext(ThemeContext)!
  const className = (style as any)?.['--flux-class'] ?? ''
  if (!container) return null
  return createPortal(
    <div class={className}>{children}</div>,
    container
  )
}
