import { useStoreContext } from '../../context'
import { FluxRoot, FluxRootProps } from './FluxRoot'

type FluxPanelProps = Partial<FluxRootProps>

/**
 * Functions the same as `<Flux />` but enables multiple unique panels with their own store.
 *
 * @example
 * const store1 = useCreateStore()
 * const store2 = useCreateStore()
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
