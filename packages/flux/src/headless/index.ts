/**
 * Headless exports for Flux
 *
 * This module provides access to Flux's state management and hooks
 * without the default HTML UI, enabling custom UI implementations
 * (e.g., for WebXR, React Three Fiber, etc.)
 */

// Export headless version of useFlux
export { useFlux } from './useFlux'

// Store and store management (factory renamed from useCreateStore in the
// phaze migration; consumers create stores outside hook semantics)
export { fluxStore, createStore } from '../store'

// Hooks for accessing store data
export { useInput } from '../hooks/useInput'
export { useValuesForPath } from '../hooks/useValuesForPath'
// `useVisiblePaths(store)` was removed in stage 5 — use `store.visiblePaths`
// directly. It's a phaze Computed<string[]>; call `store.visiblePaths()` to
// read inside an effect / computed / JSX expression.

// Store accessors. Phaze migration drops FluxStoreProvider — use
// setActiveStore() before mounting your panel root if you need a scoped
// store. Most apps just use the default `fluxStore` singleton.
export { useStoreContext, setActiveStore } from '../context'

// Tree utilities for rendering folder hierarchies
export { buildTree, isInput } from '../components/Flux/tree'

// Helper functions (folder, button, monitor, etc.)
export * from '../helpers'

// Plugin system for custom inputs
export { createPlugin } from '../plugin'

// Convenience hooks for easier headless usage
export { useFluxInputs, useFluxTree, useFluxInput, useFluxValue } from './hooks'

// Per-key signal-like accessor (callable read, .set, .subscribe).
// Compatible with fabric & photon out of the box.
export { controlAccessor, type ControlAccessor } from '../control-accessor'

// Type exports for building custom UIs
export type { StoreType, DataInput, DataItem, Data, Tree, MappedPaths } from '../types/internal'

export type {
  Schema,
  SchemaToValues,
  FluxInputs,
  SpecialInputs,
  Plugin,
  FluxInputProps,
  OnChangeHandler,
  FolderSettings,
  NumberSettings,
  Vector2d,
  Vector3d,
  Vector2dSettings,
  Vector3dSettings,
  ButtonInput,
  MonitorInput,
  CustomInput,
} from '../types/public'
