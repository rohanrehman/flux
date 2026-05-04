import { effect, untrack, cleanup, type Computed } from '@madenowhere/phaze'
import { fluxStore } from './store'
import { folder } from './helpers'
import { useValuesForPath } from './hooks'
import { useRenderRoot } from './components/Flux'
import type { FolderSettings, Schema, SchemaToValues, StoreType, OnChangeHandler } from './types'

// Preact-era `Inputs` type, inlined so we don't reach into preact/hooks.
// Deps are accepted for API parity with the preact version but are not
// used for re-running schema in phaze — reactivity handles dep changes
// via signal reads inside the schema function.
type Inputs = readonly unknown[] | undefined

export type HookSettings = { store?: StoreType; headless?: boolean }
export type SchemaOrFn<S extends Schema = Schema> = S | (() => S)

type FunctionReturnType<S extends Schema> = [
  Computed<SchemaToValues<S>>,
  (value: {
    [K in keyof Partial<SchemaToValues<S, true>>]: SchemaToValues<S, true>[K]
  }) => void,
  <T extends keyof SchemaToValues<S, true>>(path: T) => SchemaToValues<S, true>[T]
]

type ReturnType<F extends SchemaOrFn> = F extends SchemaOrFn<infer S>
  ? F extends Function
    ? FunctionReturnType<S>
    : Computed<SchemaToValues<S>>
  : never

export type HookReturnType<F extends SchemaOrFn | string, G extends SchemaOrFn> = F extends SchemaOrFn
  ? ReturnType<F>
  : ReturnType<G>

export function parseArgs(
  schemaOrFolderName: string | SchemaOrFn,
  settingsOrDepsOrSchema?: HookSettings | Inputs | SchemaOrFn,
  depsOrSettingsOrFolderSettings?: Inputs | HookSettings | FolderSettings,
  depsOrSettings?: Inputs | HookSettings,
  depsOrUndefined?: Inputs
) {
  let schema: SchemaOrFn
  let folderName: string | undefined = undefined
  let folderSettings: FolderSettings | undefined
  let hookSettings: HookSettings | undefined
  let deps: Inputs | undefined

  if (typeof schemaOrFolderName === 'string') {
    folderName = schemaOrFolderName
    schema = settingsOrDepsOrSchema as SchemaOrFn
    if (Array.isArray(depsOrSettingsOrFolderSettings)) {
      deps = depsOrSettingsOrFolderSettings
    } else {
      if (depsOrSettingsOrFolderSettings) {
        if ('store' in depsOrSettingsOrFolderSettings) {
          hookSettings = depsOrSettingsOrFolderSettings as HookSettings
          deps = depsOrSettings as Inputs
        } else {
          folderSettings = depsOrSettingsOrFolderSettings as FolderSettings
          if (Array.isArray(depsOrSettings)) {
            deps = depsOrSettings as Inputs
          } else {
            hookSettings = depsOrSettings as HookSettings
            deps = depsOrUndefined
          }
        }
      }
    }
  } else {
    schema = schemaOrFolderName as SchemaOrFn
    if (Array.isArray(settingsOrDepsOrSchema)) {
      deps = settingsOrDepsOrSchema as Inputs
    } else {
      hookSettings = settingsOrDepsOrSchema as HookSettings
      deps = depsOrSettingsOrFolderSettings as Inputs
    }
  }

  return { schema, folderName, folderSettings, hookSettings, deps: deps || [] }
}

/**
 * Phaze-native `useControls`. Component bodies in phaze run once, so this
 * hook's setup work is synchronous: parse the schema, register data,
 * wire subscriptions, return reactive accessors. Cleanup parents to the
 * caller's component scope via `effect()` + `cleanup()`.
 *
 * Signature is unchanged for static schemas. Function schemas now return
 * `[Computed<values>, set, get]` instead of `[values, set, get]`.
 *
 * @param schemaOrFolderName
 * @param settingsOrDepsOrSchema
 * @param folderSettingsOrDeps
 * @param depsOrUndefined
 */
export function useControls<S extends Schema, F extends SchemaOrFn<S> | string, G extends SchemaOrFn<S>>(
  schemaOrFolderName: F,
  settingsOrDepsOrSchema?: HookSettings | Inputs | G,
  depsOrSettingsOrFolderSettings?: Inputs | HookSettings | FolderSettings,
  depsOrSettings?: Inputs | HookSettings,
  depsOrUndefined?: Inputs
): HookReturnType<F, G> {
  const { folderName, schema, folderSettings, hookSettings } = parseArgs(
    schemaOrFolderName,
    settingsOrDepsOrSchema,
    depsOrSettingsOrFolderSettings,
    depsOrSettings,
    depsOrUndefined
  )

  const schemaIsFunction = typeof schema === 'function'

  const rawSchema = typeof schema === 'function' ? (schema as () => Schema)() : schema
  const _schema = folderName ? { [folderName]: folder(rawSchema, folderSettings) } : rawSchema

  // GlobalPanel means that no store was provided, therefore we're using the fluxStore
  const isGlobalPanel = !hookSettings?.store
  const headless = hookSettings?.headless ?? false

  useRenderRoot(isGlobalPanel && !headless)

  const store = hookSettings?.store || fluxStore

  /**
   * Parses the schema to extract the inputs initial data. Recursively
   * flattens nested folders.
   */
  const [initialData, mappedPaths] = store.getDataFromSchema(_schema)

  const allPaths: string[] = []
  const renderPaths: string[] = []
  const onChangePaths: Record<string, OnChangeHandler> = {}
  const onEditStartPaths: Record<string, (...args: any) => void> = {}
  const onEditEndPaths: Record<string, (...args: any) => void> = {}

  Object.values(mappedPaths).forEach(({ path, onChange, onEditStart, onEditEnd, transient }) => {
    allPaths.push(path)
    if (onChange) {
      onChangePaths[path] = onChange
      if (!transient) renderPaths.push(path)
    } else {
      renderPaths.push(path)
    }
    if (onEditStart) onEditStartPaths[path] = onEditStart
    if (onEditEnd) onEditEndPaths[path] = onEditEnd
  })

  // Extracts the paths from the initialData and ensures order of paths.
  const paths = store.orderPaths(allPaths)

  /**
   * Reactive flattened values. Reading inside JSX or another reactive
   * scope subscribes only to the requested paths.
   */
  const values = useValuesForPath(store, renderPaths, initialData)

  // Initialize the store with initial data and arrange disposal on
  // component unmount. The effect's only purpose is to scope the
  // cleanup() registration — addData itself reads state.data internally
  // (`if (!!input)` per-path) and writes to the same paths, which
  // without untrack creates a self-write loop where the effect's reads
  // make it subscribe to its own writes.
  effect(() => {
    untrack(() => store.addData(initialData, false))
    cleanup(() => store.disposePaths(paths))
  })

  // onChange subscriptions: phaze effects fire on registration AND on
  // dep changes, so a single effect replaces the preact "initial call +
  // subscribe" pattern. The `isFirstRun` flag carries the `initial` arg.
  Object.entries(onChangePaths).forEach(([path, onChange]) => {
    let isFirstRun = true
    effect(() => {
      const input = store.state.data[path]
      if (!input) return
      // Spread to track every property of the input proxy. Matches the
      // preact-era subscription which fired on any input change.
      const snapshot = { ...(input as object) } as any
      const value = snapshot.disabled ? undefined : snapshot.value
      untrack(() => {
        onChange(value, path, { initial: isFirstRun, get: store.get, ...snapshot })
        isFirstRun = false
      })
    })
  })

  // onEditStart / onEditEnd: subscriptions to event-emitter, dispose on
  // component unmount.
  Object.entries(onEditStartPaths).forEach(([path, onEditStart]) => {
    effect(() => {
      const unsub = store.subscribeToEditStart(path, onEditStart)
      cleanup(unsub)
    })
  })
  Object.entries(onEditEndPaths).forEach(([path, onEditEnd]) => {
    effect(() => {
      const unsub = store.subscribeToEditEnd(path, onEditEnd)
      cleanup(unsub)
    })
  })

  const set = (next: Record<string, any>) => {
    const _values = Object.entries(next).reduce(
      (acc, [p, v]) => Object.assign(acc, { [mappedPaths[p].path]: v }),
      {}
    )
    store.set(_values, false)
  }

  const get = (path: string) => store.get(mappedPaths[path].path)

  if (schemaIsFunction) return [values, set, get] as HookReturnType<F, G>
  return values as HookReturnType<F, G>
}
