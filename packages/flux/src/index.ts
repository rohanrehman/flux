
import { register } from './plugin'
import number from './plugins/Number'
import select from './plugins/Select'
import color from './plugins/Color'
import string from './plugins/String'
import boolean from './plugins/Boolean'
import vector3d from './plugins/Vector3d'
import vector2d from './plugins/Vector2d'
import image from './plugins/Image'
import interval from './plugins/Interval'
import { FluxInputs } from './types'

/**
 * Register all the primitive inputs.
 * @note could potentially be done elsewhere.
 */

register(FluxInputs.SELECT, select)
register(FluxInputs.IMAGE, image)
register(FluxInputs.NUMBER, number)
register(FluxInputs.COLOR, color)
register(FluxInputs.STRING, string)
register(FluxInputs.BOOLEAN, boolean)
register(FluxInputs.INTERVAL, interval)
register(FluxInputs.VECTOR3D, vector3d)
register(FluxInputs.VECTOR2D, vector2d)

// Main hook. The returned handle has per-key accessors (e.g. `flux.mIor`)
// typed against the schema. Idiomatic shape:
//
//   const flux = useFlux({ ... schema ... })
//   <Mesh material={{ ior: flux.mIor ?? 1.075 }} />
export { useFlux, type ControlsHandle } from './useFlux'

// Module-level `flux` proxy + factory. Same per-key accessors as the hook
// return, exposed as a global so consumers that *don't* capture the hook
// can still read values via `flux.mIor`. Prefer `const flux = useFlux(...)`
// — it's typed against the schema and ties the data to the call site that
// declared it. Module-level `flux` is kept for back-compat.
export { flux, createFluxAPI, type FluxAPI } from './flux'

// Per-key signal-like accessor (callable + .set + .subscribe). Drop-in
// for fabric/photon prop slots — both libraries duck-type on this shape.
export { controlAccessor, type ControlAccessor } from './control-accessor'

// panel components
export { Flux, FluxPanel } from './components/Flux'

// store accessor — returns the active store. Phaze migration drops the
// FluxStoreProvider component (no createContext/useContext primitives in
// phaze); apps with multiple panel roots can call setActiveStore() directly
// before mounting their <FluxPanel store={x}>.
export { useStoreContext, setActiveStore } from './context'

// export the fluxStore (default store)
// factory to create custom store (renamed from useCreateStore in the
// phaze migration — phaze components run once, so no useMemo equivalent)
export { fluxStore, createStore } from './store'

// export folder, monitor, button
export * from './helpers'

export { FluxInputs }

// glb: auto-detecting GLB animation source for flux schemas. Standalone
// async function with no module-level side effects, so it tree-shakes
// out when unused — apps that don't reference `glb` pay nothing for it.
export { glb, type GlbAnim } from './glb'
