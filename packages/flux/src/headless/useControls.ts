/**
 * Headless version of useControls.
 * Automatically passes { headless: true } to prevent UI rendering.
 */

import {
  useControls as useControlsBase,
  parseArgs,
  type HookSettings,
  type SchemaOrFn,
  type HookReturnType,
} from '../useControls'
import type { Schema, FolderSettings } from '../types'
import { reconstructArgsWithHeadless } from './useControls.utils'

// Preact-era `Inputs` type, inlined for parity. Deps are accepted but
// not used to re-run schema in phaze.
type Inputs = readonly unknown[] | undefined

/**
 * Headless `useControls` — manages state without rendering UI.
 *
 * Same surface as `useControls` from `'flux'`, with `{ headless: true }`
 * injected into hookSettings so no Flux panel mounts. Component bodies
 * in phaze run once, so the previous useMemo memoization for parseArgs /
 * arg reconstruction collapses to plain calls (Pattern 3).
 *
 * @see {@link https://github.com/rohanrehman/flux#headless-mode | Headless Mode Documentation}
 * @see useControls from 'flux' for full API documentation and examples.
 */
export function useControls<S extends Schema, F extends SchemaOrFn<S> | string, G extends SchemaOrFn<S>>(
  schemaOrFolderName: F,
  settingsOrDepsOrSchema?: HookSettings | Inputs | G,
  depsOrSettingsOrFolderSettings?: Inputs | HookSettings | FolderSettings,
  depsOrSettings?: Inputs | HookSettings,
  depsOrUndefined?: Inputs
): HookReturnType<F, G> {
  const { folderName, hookSettings } = parseArgs(
    schemaOrFolderName,
    settingsOrDepsOrSchema,
    depsOrSettingsOrFolderSettings,
    depsOrSettings,
    depsOrUndefined
  )

  const modifiedArgs = reconstructArgsWithHeadless({
    folderName,
    schemaOrFolderName,
    settingsOrDepsOrSchema,
    depsOrSettingsOrFolderSettings,
    depsOrSettings,
    depsOrUndefined,
    hookSettings,
  }) as Parameters<typeof useControlsBase>

  return useControlsBase(...modifiedArgs) as HookReturnType<F, G>
}
