/** @jsxImportSource @madenowhere/phaze */
import { signal } from '@madenowhere/phaze'
import type { FullTheme } from './styles'
import type { StoreType, PanelSettingsType, InputContextProps } from './types'
import { fluxStore } from './store'

type CSSProps = Record<string, string | number | undefined>

// ─────────────────────────────────────────────────────────────────────────────
// Phaze-native context replacements.
//
// Pattern 6 from the migration memory: phaze has no createContext/useContext.
// The four contexts in the preact era (Input / Theme / Store / PanelSettings)
// each map to one of two patterns:
//
//   - Module-level signal — for app-global values (theme, panel settings,
//     active store). Components read via the exported getter; the panel root
//     sets via the matching setter.
//   - Module-level let with imperative set+read — for per-row scoped values
//     (input context). The Row wrapper sets the current input synchronously
//     before rendering its plugin's component; the plugin reads via
//     useInputContext() ONCE at the top of its function. Phaze components
//     run once, so the captured value is stable for the lifetime of the row.
//
// This file intentionally has no createContext / Provider components — they
// don't translate to phaze's run-once model.
// ─────────────────────────────────────────────────────────────────────────────

// ── Theme ───────────────────────────────────────────────────────────────────
type ThemeContextValue = { theme: FullTheme; style: CSSProps }

const themeSignal = signal<ThemeContextValue | null>(null)

/** Reactive read of the current theme. Track-tries when called inside an effect/
 *  computed/JSX expression. Returns null if no theme has been mounted yet. */
export const useThemeContext = (): ThemeContextValue => {
  const t = themeSignal()
  if (!t) throw new Error('flux: theme not initialized — render <Flux> at the root')
  return t
}

/** Set the active theme. Called by <Flux> at mount with cleanup() to clear
 *  on unmount. Only one theme is active per app. */
export const setActiveTheme = (v: ThemeContextValue | null): void => {
  themeSignal.set(v)
}

// ── Store ───────────────────────────────────────────────────────────────────
// Most apps use the global fluxStore. <FluxPanel store={x}> can swap it for
// a scoped instance; setActiveStore is called at panel mount.
let currentStore: StoreType = fluxStore

export const useStoreContext = (): StoreType => currentStore
export const setActiveStore = (s: StoreType): void => { currentStore = s }

// ── Panel settings ──────────────────────────────────────────────────────────
const panelSettingsSignal = signal<PanelSettingsType>({ hideCopyButton: false })

export const usePanelSettingsContext = (): PanelSettingsType => panelSettingsSignal()
export const setActivePanelSettings = (v: PanelSettingsType): void => {
  panelSettingsSignal.set(v)
}

// ── Input context (per-row) ─────────────────────────────────────────────────
// The Row wrapper calls setCurrentInput(props) immediately before rendering
// the plugin's component. The plugin calls useInputContext() once at the top
// of its function to capture path + metadata. Subsequent setCurrentInput
// calls (for the next row in the panel) don't disturb captured values
// because phaze components run once.
//
// IMPORTANT: plugins must NOT call useInputContext() inside an effect or
// computed — the value would shift as other rows render. Always read once
// synchronously and close over the result.
let currentInput: InputContextProps | null = null

export function setCurrentInput(input: InputContextProps): void {
  currentInput = input
}

// Returns an empty bag when called outside a row render — preact-era
// behavior. Callers like the title-bar's useDrag legitimately have no
// input context and rely on optional-chained access (emitOnEditStart?.()
// etc.) being a no-op. Throwing here would force every non-row caller
// to add ad-hoc try/catch.
export function useInputContext<T = {}>(): InputContextProps & T {
  return (currentInput ?? ({} as InputContextProps)) as InputContextProps & T
}
