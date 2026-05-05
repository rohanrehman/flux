import { computed, untrack } from '@madenowhere/phaze'
import type { Signal } from '@madenowhere/phaze'
import type { StoreType } from './types'

/**
 * Per-input reactive accessor.
 *
 * Shape matches phaze's `Signal<T>` (callable read, `.set`, `.update`,
 * `.current`, `.subscribe`) plus a `.peek` alias for the photon naming
 * convention and a `.get` alias for fabric's tick-time reads
 * (`fec.glow.intensity?.get?.() ?? 0`). Detection layer in fabric
 * `subscribeToSignals` and photon `animate` both duck-type on
 * `.set + .subscribe`, so passing `flux.fov` straight to either works.
 *
 * Reads track the calling computation (via underlying `computed`),
 * writes go through `store.setValueAtPath` which already uses `batch()`
 * to coalesce per-tick fan-out.
 */
export type ControlAccessor<T> = Signal<T> & {
  peek: () => T
  get: () => T
}

export function controlAccessor<T = unknown>(store: StoreType, path: string): ControlAccessor<T> {
  const read = computed(() => {
    const input = store.state.data[path]
    return (input as { value?: T } | undefined)?.value as T
  }) as ControlAccessor<T>

  read.set = (next: T) => store.setValueAtPath(path, next, true)
  read.update = (fn: (prev: T) => T) => read.set(fn(untrack(() => read())))
  read.peek = read.current
  // Fabric reads each frame via `.get?.()` (untracked) — alias to `.current`.
  read.get = read.current

  return read
}
