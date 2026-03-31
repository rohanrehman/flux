import { useState, useEffect } from 'preact/hooks'
import { shallow } from 'zustand/shallow'
import type { StoreType } from '../types'

/**
 * A hook that subscribes to and returns all **visible** input paths from the store.
 *
 * @internal - Used by FluxRoot
 *
 * This is an **internal** hook used by the Flux root component (`FluxRoot`) to determine
 * which inputs should be rendered in the UI. It filters out inputs that are:
 * - Inside folders with `render` functions that return `false` (conditionally hidden)
 * - Not present in the store data
 *
 * The hook reactively updates when the store changes, ensuring the UI always reflects
 * the current visible state. Uses shallow comparison for efficient re-renders.
 *
 * @param store - The Flux store instance to subscribe to
 * @returns Array of visible input paths (dot-separated strings)
 *
 * @example
 * // Internal usage in FluxRoot component
 * function FluxRoot({ store }) {
 *   const paths = useVisiblePaths(store)
 *   const tree = useMemo(() => buildTree(paths, filter), [paths, filter])
 *
 *   // paths might be: ['position.x', 'position.y', 'color', 'settings.speed']
 *   // These are then used to build the hierarchical folder structure
 *
 *   return <Tree tree={tree} />
 * }
 *
 * @example
 * // How folders with render functions affect visibility
 * useControls({
 *   showAdvanced: false,
 *   advanced: folder({
 *     setting1: 10,
 *     setting2: 20
 *   }, {
 *     render: (get) => get('showAdvanced') // Only show when showAdvanced is true
 *   })
 * })
 *
 * // When showAdvanced = false:
 * // useVisiblePaths returns: ['showAdvanced']
 *
 * // When showAdvanced = true:
 * // useVisiblePaths returns: ['showAdvanced', 'advanced.setting1', 'advanced.setting2']
 *
 * @example
 * // Custom root component using useVisiblePaths
 * function CustomFluxPanel({ store }) {
 *   const paths = useVisiblePaths(store)
 *   const [filter, setFilter] = useState('')
 *
 *   // Filter paths based on search query
 *   const filteredPaths = paths.filter(path =>
 *     path.toLowerCase().includes(filter.toLowerCase())
 *   )
 *
 *   return (
 *     <div>
 *       <input
 *         placeholder="Filter..."
 *         value={filter}
 *         onChange={(e) => setFilter(e.target.value)}
 *       />
 *       <div>Visible inputs: {filteredPaths.length}</div>
 *       {filteredPaths.map(path => (
 *         <Control key={path} path={path} />
 *       ))}
 *     </div>
 *   )
 * }
 */
export const useVisiblePaths = (store: StoreType) => {
  const [paths, setPaths] = useState(store.getVisiblePaths())

  useEffect(() => {
    setPaths(store.getVisiblePaths())
    const unsub = store.useStore.subscribe(store.getVisiblePaths, setPaths, { equalityFn: shallow })
    return () => unsub()
  }, [store])

  return paths
}
