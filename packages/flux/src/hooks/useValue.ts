import { computed, type Computed } from '@madenowhere/phaze'
import { useStoreContext } from '../context'

/**
 * Reactive accessor for the value of a single input at `path`. Read
 * `value()` inside a reactive scope to track. Returns `undefined` if no
 * input exists at `path` or the entry isn't a value-bearing input
 * (folder/button/etc.).
 *
 * @public - For plugin development
 */
export const useValue = (path: string): Computed<any> => {
  const store = useStoreContext()
  return computed(() => {
    const item = store.state.data[path]
    return item && 'value' in item ? (item as any).value : undefined
  })
}

/**
 * Reactive accessor for multiple input values keyed by full path. Read
 * `values()` inside a reactive scope to track; only the requested paths
 * are tracked, so other store changes won't re-run consumers.
 *
 * @public - For plugin development
 */
export const useValues = <T extends string>(paths: T[]): Computed<{ [key in T]: any }> => {
  const store = useStoreContext()
  return computed(() => {
    return paths.reduce((acc, path) => {
      const item = store.state.data[path]
      if (item && 'value' in item) (acc as any)[path] = (item as any).value
      return acc
    }, {} as { [key in T]: any })
  })
}
