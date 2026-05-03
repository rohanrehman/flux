import { computed, type Computed } from '@madenowhere/phaze'
import type { StoreType } from '../types'

/**
 * Reactive accessor for the list of currently-visible input paths.
 *
 * @internal - Used by FluxRoot
 *
 * `getVisiblePaths()` reads `store.state.data` internally, so the
 * computed re-runs whenever paths are added, removed, or have their
 * `__refCount`/`render`/folder visibility flip. Read `paths()` inside a
 * reactive scope to track.
 */
export const useVisiblePaths = (store: StoreType): Computed<string[]> => {
  return computed(() => store.getVisiblePaths())
}
