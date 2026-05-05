import { computed, type Computed } from '@madenowhere/phaze'
import type { StoreType } from '../types'

/**
 * Reactive accessor for the list of currently-visible input paths.
 *
 * @internal - Used by FluxRoot
 *
 * `getVisiblePaths()` reads `store.state.data` internally, so the
 * computed re-runs whenever paths are added, removed, or have their
 * `__refCount` flip. Folder visibility (render-fn-driven show/hide) is
 * NOT tracked here — that gate lives at the Folder level (see Folder.tsx)
 * via display:none, which avoids rebuilding the whole panel on every
 * render-fn dep change.
 */
export const useVisiblePaths = (store: StoreType): Computed<string[]> => {
  return computed(() => store.getVisiblePaths())
}
