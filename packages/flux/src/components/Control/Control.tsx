/** @jsxImportSource @madenowhere/phaze */
import { untrack } from '@madenowhere/phaze'
import { ControlInput } from './ControlInput'
import { log, FluxErrors } from '../../utils/log'
import { Plugins } from '../../plugin'
import { Button } from '../Button'
import { SpecialComponents, registerSpecialComponent } from './special-registry'
import { useInputForStore } from '../../hooks/useInput'
import { SpecialInputs, type StoreType } from '../../types'

type ControlProps = { path: string; store: StoreType }

// Button is small + commonly used → register statically. Monitor and
// ButtonGroup are larger and gated behind `@rohanrehman/flux/optional`,
// which registers them on import. Schemas that declare MONITOR or
// BUTTON_GROUP without importing /optional fall through to "unsupported
// input" (logged warning).
registerSpecialComponent(SpecialInputs.BUTTON, Button)

export function Control({ path, store }: ControlProps) {
  const [inputSignal, { set, setSettings, disable, storeId, emitOnEditStart, emitOnEditEnd }] = useInputForStore(store, path)
  // Snapshot at row mount — type/key/label don't change after the input
  // is registered. Crucially: read inside untrack() so the parent thunk
  // (FluxCore's TreeWrapper renderer) doesn't subscribe to the input's
  // computed. Without untrack, every drag-driven write to value/fromPanel
  // re-runs useInput's spread-based computed, returns a new object, and
  // the parent thunk re-mounts the entire panel (including the live drag's
  // useRawDrag instance — which is why pointerup arrives at a fresh
  // instance with g.active=false and the cursor never reverts).
  // Live value reactivity flows through the store via useInputSetters'
  // valueGetter; Control itself only needs the static shape.
  const input = untrack(() => inputSignal())
  if (!input) return null

  const { type, label, key, render, ...inputProps } = input

  // Render-fn-driven visibility (input-level). Mirrors the per-Folder
  // pattern in Folder.tsx — the Control stays in the tree (so we don't
  // <For>-reconcile siblings on every render-fn dep change), but its
  // `display` flips reactively. `store.get` inside the thunk tracks the
  // controlling input's value signal so toggling visibility is instant.
  // `display: contents` keeps the wrapper layout-transparent — the
  // <ControlInput>/<SpecialInput> shows up as a direct grid item of
  // the surrounding `.flux-folder-content`, just like before.
  const displayStyle = render
    ? () => ({ display: (render as any)(store.get) ? 'contents' : 'none' })
    : undefined

  let inner: any
  if (type in SpecialInputs) {
    // SpecialInput components have heterogeneous prop shapes (Button,
    // ButtonGroup, Monitor) that all share `label` + `path` plus their
    // own extras spread through `inputProps`. The keyed dispatch on
    // `type` resolves to one concrete component but TS can't narrow the
    // union, so the JSX call site widens via `as any`.
    const SpecialInputForType = SpecialComponents[type] as any
    if (!SpecialInputForType) {
      log(FluxErrors.UNSUPPORTED_INPUT, type, path)
      return null
    }
    inner = <SpecialInputForType label={label} path={path} store={store} {...inputProps} />
  } else if (!(type in Plugins)) {
    log(FluxErrors.UNSUPPORTED_INPUT, type, path)
    return null
  } else {
    inner = (
      // @ts-expect-error
      <ControlInput
        key={storeId + path}
        type={type}
        label={label}
        storeId={storeId}
        path={path}
        valueKey={key}
        setValue={set}
        setSettings={setSettings}
        disable={disable}
        emitOnEditStart={emitOnEditStart}
        emitOnEditEnd={emitOnEditEnd}
        store={store}
        {...inputProps}
      />
    )
  }

  // No render fn → no wrapper, original behavior. With render fn → span
  // with reactive display:contents/none gates visibility without affecting
  // grid layout (display:contents makes the span layout-transparent).
  return displayStyle
    ? <span style={displayStyle as any}>{inner}</span>
    : inner
}
