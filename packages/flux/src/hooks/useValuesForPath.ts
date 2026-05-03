import { computed, type Computed } from '@madenowhere/phaze'
import { getValuesForPaths } from '../utils/data'
import type { Data, StoreType } from '../types'

/**
 * Reactive accessor returning flattened values for a set of paths.
 *
 * @internal - Used by useControls
 *
 * Merges `initialData` with the live store data so consumers can read
 * before the store finishes initializing. Reads inside the returned
 * computed track every property accessed by `getValuesForPaths`, so
 * adding/removing/disabling those paths flows through to consumers.
 */
export function useValuesForPath(
  store: StoreType,
  paths: string[],
  initialData: Data
): Computed<Record<string, any>> {
  return computed(() => {
    const data = { ...initialData, ...store.state.data }
    return getValuesForPaths(data, paths)
  })
}
