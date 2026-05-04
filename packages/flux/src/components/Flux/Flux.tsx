/** @jsxImportSource @madenowhere/phaze */
import { fluxStore } from '../../store'
import { FluxRoot, FluxRootProps } from './FluxRoot'

type FluxProps = Omit<Partial<FluxRootProps>, 'store'>

/**
 * Renders a Flux panel against the global `fluxStore`. Mount this once
 * somewhere in your tree.
 *
 * Phaze migration note: the preact-era PanelLifecycle/useRenderRoot
 * machinery (auto-mount on first useControls if no explicit <Flux>) was
 * removed. That pattern relied on preact's render-then-effects ordering;
 * in phaze it created a second render tree at #flux__root that briefly
 * coexisted with the user's explicit <Flux>, doubling subscriptions and
 * causing useControls to fire twice. Users now render <Flux> (or
 * <FluxPanel>) themselves — the simplest reliable contract in phaze's
 * run-once model.
 */
export function Flux(props: FluxProps) {
  return <FluxRoot store={fluxStore} {...props} />
}
