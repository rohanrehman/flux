import { createContext } from 'preact'
import { useContext } from 'preact/hooks'
import type { JSX, ComponentChildren } from 'preact'
import type { FullTheme } from './styles'
import type { StoreType, PanelSettingsType, InputContextProps } from './types'

export const InputContext = createContext({})

export function useInputContext<T = {}>() {
  return useContext(InputContext) as InputContextProps & T
}

type ThemeContextProps = { theme: FullTheme; style: JSX.CSSProperties }

export const ThemeContext = createContext<ThemeContextProps | null>(null)

export const StoreContext = createContext<StoreType | null>(null)

export const PanelSettingsContext = createContext<PanelSettingsType | null>(null)

export function useStoreContext() {
  return useContext(StoreContext)!
}

export function usePanelSettingsContext() {
  return useContext(PanelSettingsContext)!
}

type FluxStoreProviderProps = {
  children: ComponentChildren
  store: StoreType
}

export function FluxStoreProvider({ children, store }: FluxStoreProviderProps) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}
