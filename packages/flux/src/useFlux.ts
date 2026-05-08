import { effect, untrack, cleanup, type Computed } from '@madenowhere/phaze'
import { fluxStore } from './store'
import { folder } from './helpers'
import { useValuesForPath } from './hooks'
import { controlAccessor, type ControlAccessor } from './control-accessor'
import type { FolderSettings, Schema, SchemaToValues, StoreType, OnChangeHandler } from './types'

export type HookSettings = { store?: StoreType; headless?: boolean }
export type SchemaOrFn<S extends Schema = Schema> = S | (() => S)

/**
 * Phaze-native return shape from `useControls`.
 *
 * - **Callable** (`flux()`) — flat snapshot Computed of every input value.
 *   Use inside JSX thunks for displaying current state, JSON dumps, etc.
 * - **Per-key access** (`flux.fov`, `flux.color`) — phaze-Signal-shaped
 *   accessor for one input. Both fabric (`subscribeToSignals`) and photon
 *   (`animate` target detection) duck-type on `.set + .subscribe`, so
 *   passing `flux.fov` directly to either Just Works.
 * - **Computed members** (`flux.subscribe`, `flux.current`) — inherited
 *   from the snapshot Computed.
 * - **Batch helpers** (`flux.set({...})`, `flux.get('fov')`) — bulk write
 *   and imperative read. User input keys take precedence over these
 *   names if they collide; pick another helper name (e.g. dedicated
 *   `flux[FluxOps]`) if you must use `set`/`get` as input keys.
 */
export type ControlsHandle<V extends Record<string, any> = Record<string, any>> = Computed<V> & {
  set: (next: Partial<V>) => void
  get: <K extends keyof V>(key: K) => V[K]
  merge: <T extends Record<string, any>>(defaults: T, override?: Partial<T>) => T
} & {
  [K in keyof V as K extends 'set' | 'get' | 'merge' | 'current' | 'subscribe' | 'name' ? never : K]: ControlAccessor<V[K]>
}

export function parseArgs(
  schemaOrFolderName: string | SchemaOrFn,
  settingsOrSchema?: HookSettings | SchemaOrFn,
  folderSettingsOrSettings?: HookSettings | FolderSettings
) {
  let schema: SchemaOrFn
  let folderName: string | undefined = undefined
  let folderSettings: FolderSettings | undefined
  let hookSettings: HookSettings | undefined

  if (typeof schemaOrFolderName === 'string') {
    folderName = schemaOrFolderName
    schema = settingsOrSchema as SchemaOrFn
    if (folderSettingsOrSettings) {
      if ('store' in folderSettingsOrSettings) {
        hookSettings = folderSettingsOrSettings as HookSettings
      } else {
        folderSettings = folderSettingsOrSettings as FolderSettings
      }
    }
  } else {
    schema = schemaOrFolderName as SchemaOrFn
    hookSettings = settingsOrSchema as HookSettings
  }

  return { schema, folderName, folderSettings, hookSettings }
}

/**
 * Phaze-native `useFlux`. Component bodies in phaze run once, so the
 * setup work is synchronous: parse the schema, register data, wire
 * subscriptions, return a reactive handle. Cleanup parents to the
 * caller's component scope via `effect()` + `cleanup()`.
 *
 * The returned handle is callable (snapshot read), exposes per-key signal
 * accessors via property access, and has `.set`/`.get` batch methods. See
 * `ControlsHandle` for details. Function-schema and static-schema forms
 * return the *same* shape — the preact-era `[values, set, get]` tuple is
 * gone; callers use `handle.set(...)` and `handle.get(...)` directly.
 */
type ResolveHandle<F, G> = F extends SchemaOrFn<infer S>
  ? ControlsHandle<SchemaToValues<S> & Record<string, any>>
  : G extends SchemaOrFn<infer S2>
  ? ControlsHandle<SchemaToValues<S2> & Record<string, any>>
  : never

export function useFlux<S extends Schema, F extends SchemaOrFn<S> | string, G extends SchemaOrFn<S>>(
  schemaOrFolderName: F,
  settingsOrSchema?: HookSettings | G,
  folderSettingsOrSettings?: HookSettings | FolderSettings,
  trailingSettings?: HookSettings
): ResolveHandle<F, G> {
  const { folderName, schema, folderSettings, hookSettings: parsedSettings } = parseArgs(
    schemaOrFolderName as string | SchemaOrFn,
    settingsOrSchema as HookSettings | SchemaOrFn | undefined,
    folderSettingsOrSettings
  )
  const hookSettings = parsedSettings ?? trailingSettings

  const rawSchema = typeof schema === 'function' ? (schema as () => Schema)() : schema
  const _schema = folderName ? { [folderName]: folder(rawSchema, folderSettings) } : rawSchema

  // The preact-era auto-panel machinery (useRenderRoot / PanelLifecycle)
  // was deleted with the move to phaze: it created a second render tree
  // at #flux__root that doubled subscriptions and caused this hook to
  // fire twice. Users now render <Flux> (or <FluxPanel>) explicitly.
  const store = hookSettings?.store || fluxStore

  // Parses the schema to extract the inputs initial data. Recursively
  // flattens nested folders.
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

  // Mirror the key→path mapping onto the store so the module-level `flux`
  // proxy can resolve `flux.<key>` to a ControlAccessor without consumers
  // needing to capture this hook's return value. Mounting / unmounting
  // doesn't have to clean these up — they're stable identifiers, and the
  // ControlAccessor reads through state.data which is the source of truth
  // for "input still mounted" via __refCount.
  for (const key in mappedPaths) {
    store.registerKey(key, mappedPaths[key].path)
  }

  // Extracts the paths from the initialData and ensures order of paths.
  const paths = store.orderPaths(allPaths)

  // Reactive flattened values. Reading inside JSX or another reactive
  // scope subscribes only to the requested paths.
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

  const setMany = (next: Record<string, unknown>) => {
    const fullPaths: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(next)) {
      const m = mappedPaths[k]
      if (m) fullPaths[m.path] = v
    }
    store.set(fullPaths, false)
  }

  const getOne = (key: string) => {
    const m = mappedPaths[key]
    return m ? store.get(m.path) : undefined
  }

  // `flux.merge(defaults, override?)` — overlay schema-registered keys with
  // their ControlAccessors, plain values otherwise. Matches the module-
  // level `flux.merge` shape so `<Camera {...flux.merge(DEFAULTS, props)}>`
  // works the same whether you read from the module-level `flux` proxy or
  // a captured `useFlux({...})` handle. When a key isn't in the schema,
  // the spread default/override wins.
  const mergeFn = <T extends Record<string, any>>(defaults: T, override?: Partial<T>): T => {
    const out: any = { ...defaults, ...(override ?? {}) }
    for (const key in defaults) {
      if (mappedPaths[key]) {
        let acc = accessorCache.get(key)
        if (!acc) {
          acc = controlAccessor(store, mappedPaths[key].path)
          accessorCache.set(key, acc)
        }
        out[key] = acc
      }
    }
    return out as T
  }

  // Cache per-key accessors so repeated `flux.fov` reads return the same
  // object identity (lets consumers compare references / use as effect
  // deps). Cleared via cleanup if needed; for now they live as long as
  // the panel mount.
  const accessorCache = new Map<string, ControlAccessor<unknown>>()

  // Reflect.get fall-throughs land on `values` (a Computed), so callers
  // get `.subscribe`/`.current` from the underlying Computed without us
  // re-implementing them.
  return new Proxy(values as any, {
    apply: (_target, _this, _args) => values(),
    get: (target, prop, receiver) => {
      // Symbols and well-known JS internals route to the underlying
      // Computed (instanceof checks, iterators, etc.).
      if (typeof prop === 'symbol') return Reflect.get(target, prop, receiver)

      // User input keys take precedence — if a schema names a key `set`
      // or `get`, the user's accessor is what they want. Helper methods
      // are below.
      if (mappedPaths[prop]) {
        let acc = accessorCache.get(prop)
        if (!acc) {
          acc = controlAccessor(store, mappedPaths[prop].path)
          accessorCache.set(prop, acc)
        }
        return acc
      }

      if (prop === 'set')   return setMany
      if (prop === 'get')   return getOne
      if (prop === 'merge') return mergeFn

      return Reflect.get(target, prop, receiver)
    },
  }) as ResolveHandle<F, G>
}
