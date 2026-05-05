/** @jsxImportSource @madenowhere/phaze */
// Portal helper — lives in its own file so the `@madenowhere/phaze/portal`
// subpath import is reachable ONLY through this module. The UI barrel
// (`./index.ts`) does NOT re-export Portal — consumers that need it
// (color picker, joystick, image plugins) import directly from this
// path. Anything pulling from the UI barrel (Label / Row / Overlay /
// etc.) doesn't drag the portal subpath into the bundle.
import { Portal as PhazePortal } from '@madenowhere/phaze/portal'
import { useThemeContext } from '../../context'
import type { JSXChild } from '@madenowhere/phaze'

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
