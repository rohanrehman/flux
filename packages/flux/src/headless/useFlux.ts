/**
 * Headless version of `useFlux` — same API as `useFlux` from `'flux'`,
 * with `{ headless: true }` injected into hookSettings so no Flux panel
 * mounts. Returns the same `ControlsHandle` (callable snapshot, per-key
 * signal accessors, batch set/get).
 */

import { useFlux as useFluxBase, type HookSettings, type SchemaOrFn } from '../useFlux'
import type { Schema, FolderSettings } from '../types'

const headless = (s?: HookSettings): HookSettings => ({ ...s, headless: true })

/**
 * Headless `useFlux` — returns the same `ControlsHandle` as `useFlux` from
 * `'flux'`, but injects `{ headless: true }` so no panel mounts. Same
 * single-overload shape as the base hook so generic inference behaves
 * identically.
 */
export function useFlux<S extends Schema, F extends SchemaOrFn<S> | string, G extends SchemaOrFn<S>>(
  schemaOrFolderName: F,
  settingsOrSchema?: HookSettings | G,
  folderSettingsOrSettings?: HookSettings | FolderSettings,
  trailingSettings?: HookSettings
) {
  // Inject headless into whichever slot holds HookSettings. The base
  // hook's parseArgs handles the trailing-settings vs folder-settings
  // disambiguation; we just need to make sure `headless: true` ends up
  // on the HookSettings the user passed (or a fresh one).
  if (typeof schemaOrFolderName === 'string') {
    // Folder form: (folderName, schema, [folderSettings|settings], [settings])
    if (trailingSettings) {
      return useFluxBase(
        schemaOrFolderName as F,
        settingsOrSchema as G,
        folderSettingsOrSettings,
        headless(trailingSettings)
      )
    }
    if (folderSettingsOrSettings && 'store' in (folderSettingsOrSettings as object)) {
      return useFluxBase(
        schemaOrFolderName as F,
        settingsOrSchema as G,
        undefined,
        headless(folderSettingsOrSettings as HookSettings)
      )
    }
    return useFluxBase(
      schemaOrFolderName as F,
      settingsOrSchema as G,
      folderSettingsOrSettings,
      headless()
    )
  }
  // Schema-only form: (schema, [settings])
  return useFluxBase(schemaOrFolderName, headless(settingsOrSchema as HookSettings | undefined))
}
