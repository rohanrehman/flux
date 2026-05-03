import { useThemeContext } from '../context'
import { warn, FluxErrors } from '../utils'
import type { FullTheme } from './theme'

export { mergeTheme, getDefaultTheme } from './theme'
export type { FullTheme, FluxCustomTheme } from './theme'

/** Read a resolved theme value from context (follows `$reference` chains).
 *  Phaze migration: reads from a module-level signal set by <Flux> at root
 *  mount. Returns '' if called before the panel mounts (defensive). */
export function useTh<C extends keyof FullTheme>(category: C, key: keyof FullTheme[C]): string {
  let ctx
  try { ctx = useThemeContext() } catch { return '' }
  const { theme } = ctx
  const cat = theme[category] as Record<string, string> | undefined
  if (!cat || !(key in cat)) {
    warn(FluxErrors.THEME_ERROR, category, key)
    return ''
  }
  let _key = key as string
  while (true) {
    const value = cat[_key]
    if (typeof value === 'string' && value.charAt(0) === '$') {
      _key = value.slice(1)
    } else {
      return value
    }
  }
}
