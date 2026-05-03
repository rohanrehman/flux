/** @jsxImportSource @madenowhere/phaze */
import { useStoreContext } from '../../context'
import { FluxRoot, FluxRootProps } from './FluxRoot'

type FluxPanelProps = Partial<FluxRootProps>

/**
 * Functions the same as `<Flux />` but enables multiple unique panels with
 * their own store.
 *
 * Phaze migration: useStoreContext() now returns the active store
 * (defaults to fluxStore). Apps that want a scoped store pass it via the
 * `store` prop, the same as before — there's no Provider wrapper.
 *
 * @example
 * const store1 = createStore()
 * const store2 = createStore()
 *
 * return (
 *   <>
 *     <FluxPanel store={store1} />
 *     <FluxPanel store={store2} />
 *   </>
 * )
 */
export function FluxPanel({ store, ...props }: FluxPanelProps) {
  const parentStore = useStoreContext()
  const _store = store === undefined ? parentStore : store
  return <FluxRoot store={_store} {...props} />
}
