/**
 * Headless exports for Flux
 *
 * This module provides access to Flux's state management and hooks
 * without the default HTML UI, enabling custom UI implementations
 * (e.g., for WebXR, React Three Fiber, etc.)
 */

// Export headless version of useControls
export { useControls } from './useControls'

// Store and store management (factory renamed from useCreateStore in the
// phaze migration; consumers create stores outside hook semantics)
export { fluxStore, createStore } from '../store'

// Hooks for accessing store data
export { useInput } from '../hooks/useInput'
export { useVisiblePaths } from '../hooks/useVisiblePaths'
export { useValuesForPath } from '../hooks/useValuesForPath'

// Context providers for custom stores
export { useStoreContext, FluxStoreProvider } from '../context'

// Tree utilities for rendering folder hierarchies
export { buildTree, isInput } from '../components/Flux/tree'

// Helper functions (folder, button, monitor, etc.)
export * from '../helpers'

// Plugin system for custom inputs
export { createPlugin } from '../plugin'

// Convenience hooks for easier headless usage
export { useFluxInputs, useFluxTree, useFluxInput } from './hooks'

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
