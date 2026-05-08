import { store } from '@madenowhere/phaze/store'
import { untrack, batch, computed } from '@madenowhere/phaze'
import { updateInput, warn, FluxErrors, getUid, getDataFromSchema } from './utils'
import { SpecialInputs, MappedPaths, DataInput } from './types'
import type { FolderSettings, State, StoreType } from './types'
import { createEventEmitter } from './eventEmitter'

// Phaze-native flux store — a deeply reactive proxy. Reads inside phaze
// effects/computeds auto-track; writes notify per-property. Replaces the
// zustand `create()` + `subscribeWithSelector` middleware that the preact
// version used. Consumers read `s.state.data[path]` directly inside a
// reactive scope; no selectors, no equality functions.
export const Store = function (this: StoreType) {
  const state = store<State>({ data: {} })
  const eventEmitter = createEventEmitter()

  this.storeId = getUid()
  this.state = state
  /**
   * Folders will hold the folder settings for the pane.
   * @note possibly make this reactive
   */
  const folders: Record<string, FolderSettings> = {}

  /**
   * OrderedPaths will hold all the paths in a parent -> children order.
   * This will ensure we can display the controls in a predictable order.
   */
  const orderedPaths = new Set<string>()

  // Module-level `flux` proxy uses this to resolve `flux.fov` → "Camera.fov"
  // → ControlAccessor for that path — without each consumer needing to
  // capture the proxy `useControls()` returns.
  this.keyToPath = {}
  this.registerKey = (key, path) => {
    const existing = this.keyToPath[key]
    if (existing && existing !== path) {
      warn(FluxErrors.DUPLICATE_KEYS, key, path, existing)
      return
    }
    this.keyToPath[key] = path
  }

  /**
   * For a given data structure, gets all paths for which inputs have
   * a reference __refCount superior to zero. This function is used by the
   * root pane to only display the inputs that are consumed by mounted
   * components.
   *
   * Reads here track inside reactive scopes — calling getVisiblePaths()
   * from a phaze effect/computed re-runs whenever any consumed property
   * changes. No selector/equality dance needed.
   */
  this.getVisiblePaths = () => {
    const data = this.getData()
    const visiblePaths: string[] = []
    orderedPaths.forEach((path) => {
      if (path in data && data[path].__refCount > 0) {
        // Input-level render fns no longer filter here — they gate
        // visibility reactively at the <Control> level (display:none
        // thunk), same pattern as folder-level render. That keeps the
        // panel structure stable on render-fn dep changes (no re-mount,
        // no <For> reconcile churn) and removes the last untrack().
        visiblePaths.push(path)
      }
    })
    return visiblePaths
  }

  // Reactive visible-paths accessor. `getVisiblePaths()` reads tracked
  // signals on `state.data` (Object.keys via the data proxy + per-input
  // __refCount). Wrapping in computed() memoizes — consumers reading
  // `visiblePaths()` inside a phaze scope auto-subscribe.
  this.visiblePaths = computed(() => this.getVisiblePaths())

  // adds paths to OrderedPaths
  this.setOrderedPaths = (newPaths) => {
    newPaths.forEach((p) => orderedPaths.add(p))
  }

  this.orderPaths = (paths) => {
    this.setOrderedPaths(paths)
    return paths
  }

  /**
   * When the useControls hook unmounts, it will call this function that will
   * decrease the __refCount of all the inputs. When an input __refCount reaches 0,
   * it should no longer be displayed in the panel.
   *
   * @param paths
   */
  this.disposePaths = (paths) => {
    batch(() => {
      const data = state.data
      paths.forEach((path) => {
        if (path in data) {
          const input = data[path]
          input.__refCount--
          if (input.__refCount === 0 && input.type in SpecialInputs) {
            // this makes sure special inputs such as buttons are properly
            // refreshed. This might need some attention though.
            delete data[path]
          }
        }
      })
    })
  }

  this.dispose = () => {
    state.data = {}
  }

  this.getFolderSettings = (path) => {
    return folders[path] || {}
  }

  /**
   * Returns the data proxy. Reads inside a phaze reactive scope (effect /
   * computed / JSX expression) automatically track. Outside a reactive
   * scope this is just a plain read — same shape as the preact `getState`
   * accessor it replaces.
   */
  this.getData = () => {
    return state.data
  }

  /**
   * Merges the data passed as an argument with the store data.
   * If an input path from the data already exists in the store,
   * the function doesn't update the data but increments __refCount
   * to keep track of how many components use that input key.
   *
   * Uses depsChanged to trigger a recompute and update inputs
   * settings if needed.
   *
   * @param newData the data to update
   * @param override force-overwrite settings even when refCount > 0
   */
  this.addData = (newData, override) => {
    // Batch every write across all paths into a single notification flush.
    // Without this, N inserted paths fire N separate KEYS bumps, each of
    // which cascades through useVisiblePaths → tree → FluxRoot's
    // TreeWrapper thunk and forces the entire panel to re-mount N times
    // at startup. Same hazard on hot-update with `Object.assign(input,
    // rest)` mutating multiple properties of an existing input.
    batch(() => {
      const data = state.data
      Object.entries(newData).forEach(([path, newInputData]) => {
        let input = data[path]

        // If an input already exists compare its values and increase the reference __refCount.
        if (!!input) {
          // @ts-ignore
          const { type, value, ...rest } = newInputData
          if (type !== input.type) {
            warn(FluxErrors.INPUT_TYPE_OVERRIDE, path, input.type, type)
          } else {
            if (input.__refCount === 0 || override) {
              Object.assign(input, rest)
            }
            input.__refCount++
          }
        } else {
          data[path] = { ...newInputData, __refCount: 1 }
        }
      })
    })
  }

  /**
   * Shorthand function to set the value of an input at a given path.
   *
   * @param path path of the input
   * @param value new value of the input
   */
  this.setValueAtPath = (path, value, fromPanel) => {
    // updateInput writes input.value AND input.fromPanel — without batch
    // each fires its own subscriber wave. Drag pointermove calls this
    // 60+ times/sec; halving the notification count via batch matters.
    batch(() => {
      const data = state.data
      //@ts-expect-error (we always update inputs with a value)
      updateInput(data[path], value, path, this, fromPanel)
    })
  }

  this.setSettingsAtPath = (path, settings) => {
    const data = state.data
    //@ts-expect-error (we always update inputs with settings)
    data[path].settings = { ...data[path].settings, ...settings }
  }

  this.disableInputAtPath = (path, flag) => {
    const data = state.data
    //@ts-expect-error (we always update inputs with a value)
    data[path].disabled = flag
  }

  this.set = (values, fromPanel: boolean) => {
    batch(() => {
      const data = state.data
      Object.entries(values).forEach(([path, value]) => {
        try {
          //@ts-expect-error (we always update inputs with a value)
          updateInput(data[path], value, undefined, undefined, fromPanel)
        } catch (e) {
          if ((typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')) {
            // eslint-disable-next-line no-console
            console.warn(`[This message will only show in development]: \`set\` for path ${path} has failed.`, e)
          }
        }
      })
    })
  }

  /**
   * Imperative read — returns the input at a path WITHOUT subscribing
   * the calling reactive scope. Use for one-shot reads in event handlers,
   * validation utilities, etc. Reactive consumers should read
   * `getData()[path]` directly so changes flow through.
   */
  this.getInput = (path) => {
    try {
      return untrack(() => state.data[path]) as DataInput
    } catch (e) {
      warn(FluxErrors.PATH_DOESNT_EXIST, path)
    }
  }

  this.get = (path) => {
    return this.getInput(path)?.value
  }

  this.emitOnEditStart = (path: string) => {
    eventEmitter.emit(`onEditStart:${path}`, this.get(path), path, { ...this.getInput(path), get: this.get })
  }

  this.emitOnEditEnd = (path: string) => {
    eventEmitter.emit(`onEditEnd:${path}`, this.get(path), path, { ...this.getInput(path), get: this.get })
  }

  this.subscribeToEditStart = (path: string, listener: (value: any) => void): (() => void) => {
    const _path = `onEditStart:${path}`
    eventEmitter.on(_path, listener)
    return () => eventEmitter.off(_path, listener)
  }

  this.subscribeToEditEnd = (path: string, listener: (value: any) => void): (() => void) => {
    const _path = `onEditEnd:${path}`
    eventEmitter.on(_path, listener)
    return () => eventEmitter.off(_path, listener)
  }

  this.getDataFromSchema = (schema) => {
    const mappedPaths: MappedPaths = {}
    const data = getDataFromSchema(schema, '', mappedPaths, folders)
    return [data, mappedPaths]
  }
} as unknown as { new (): StoreType }

export const fluxStore = new Store()

/**
 * Create a fresh store instance scoped to a component or sub-tree.
 * Renamed from `useCreateStore` (preact era) since phaze components run
 * once — there's no useMemo equivalent and no need for one.
 */
export function createStore() {
  return new Store()
}

if ((typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') && typeof window !== 'undefined') {
  // TODO remove store from window
  // @ts-expect-error
  window.__STORE = fluxStore
}
