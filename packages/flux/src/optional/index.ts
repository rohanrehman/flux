// Optional input entry — Monitor + ButtonGroup
// ──────────────────────────────────────────────────────────────────────────
// Importing this module has TWO effects:
//
//   1. Registers Monitor + ButtonGroup into the special-component registry
//      (Control.tsx dispatches on this map at render time).
//   2. Exposes the `monitor` and `buttonGroup` helper factories.
//
// Both effects must travel together: registering without exporting the
// helpers means the user can't actually declare those inputs; exporting
// the helpers without registering means the panel renders nothing for
// MONITOR / BUTTON_GROUP rows.
//
// Apps that don't use these inputs simply don't import this entry;
// Monitor (~140 LoC + canvas hook + colord gradient utilities) and
// ButtonGroup (~45 LoC) tree-shake out of the bundle.
//
// Usage:
//   import { useFlux, folder } from '@rohanrehman/flux'
//   import { monitor, buttonGroup } from '@rohanrehman/flux/optional'
//
//   useFlux({
//     fps: monitor(() => state.fps, { graph: true }),
//     actions: buttonGroup({ go: () => ..., reset: () => ... }),
//   })

import { Monitor } from '../components/Monitor'
import { ButtonGroup } from '../components/ButtonGroup'
import { registerSpecialComponent } from '../components/Control/special-registry'
import { SpecialInputs } from '../types'

registerSpecialComponent(SpecialInputs.MONITOR,      Monitor)
registerSpecialComponent(SpecialInputs.BUTTON_GROUP, ButtonGroup)

export { monitor }      from '../helpers/monitor'
export { buttonGroup }  from '../helpers/buttonGroup'

// Type re-exports for convenience (so consumers don't need to dual-import
// from main + /optional just to type their schema).
export type {
  MonitorInput,
  MonitorSettings,
  ButtonGroupInput,
  ButtonGroupInputOpts,
} from '../types/public'
