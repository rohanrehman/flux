// Special-input component registry.
// ──────────────────────────────────────────────────────────────────────────
// Decouples Control.tsx's static dispatch table from the actual component
// implementations. Components register themselves into this map at module
// load time so an app that never imports the helpers (`monitor`,
// `buttonGroup`) doesn't ship the corresponding UI components.
//
// `Button` stays as a static import in Control.tsx — it's tiny (~25 LoC)
// and `button(...)` is a common-enough escape hatch that gating it would
// only add API friction with negligible savings. `Monitor` (~140 LoC) and
// `ButtonGroup` (~45 LoC) are gated through this registry.
//
// Registered by `@rohanrehman/flux/optional`. If a schema declares a
// MONITOR or BUTTON_GROUP input but the optional entry hasn't been
// imported, Control falls through to the unsupported-input branch.

export const SpecialComponents: Record<string, any> = {}

export function registerSpecialComponent(type: string, component: any): void {
  SpecialComponents[type] = component
}
