/** @jsxImportSource @madenowhere/phaze */
import { Portal as PhazePortal } from '@madenowhere/phaze/portal'
import { useThemeContext } from '../../context'
import type { JSXChild } from '@madenowhere/phaze'
export { Overlay } from './StyledUI'

export function Portal({ children, container = globalThis?.document?.body }: { children?: JSXChild; container?: Element | null }) {
  const { style } = useThemeContext()
  const className = (style as any)?.['--flux-class'] ?? ''
  if (!container) return null
  return (
    <PhazePortal mount={container}>
      <div class={className}>{children}</div>
    </PhazePortal>
  )
}
