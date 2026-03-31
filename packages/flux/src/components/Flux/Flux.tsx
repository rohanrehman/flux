import { useEffect } from 'preact/hooks'
import { render } from 'preact'
import { fluxStore } from '../../store'
import { FluxRoot, FluxRootProps } from './FluxRoot'

/**
 * Manages the lifecycle of the global Flux panel, including creation, cleanup,
 * and reference counting to ensure the panel is only removed when no components
 * are using it.
 */
class PanelLifecycle {
  private refCount = 0
  private rootEl: HTMLElement | null = null
  private initialized = false
  private explicitPanelInTree = false

  /**
   * Mounts a new instance of the global panel.
   * Increments reference count and creates the panel if it doesn't exist.
   */
  mount(): void {
    this.refCount++

    if (!this.initialized && !this.explicitPanelInTree) {
      this.createPanel()
      this.initialized = true
    }
  }

  /**
   * Unmounts an instance of the global panel.
   * Decrements reference count and destroys the panel when count reaches zero.
   */
  unmount(): void {
    this.refCount--

    if (this.refCount === 0 && this.initialized) {
      this.destroyPanel()
      this.initialized = false
    }
  }

  /**
   * Creates the panel DOM element and renders into it with Preact.
   * @private
   */
  private createPanel(): void {
    if (!this.rootEl) {
      this.rootEl =
        document.getElementById('flux__root') || Object.assign(document.createElement('div'), { id: 'flux__root' })

      if (document.body) {
        document.body.appendChild(this.rootEl)
        render(<Flux isRoot />, this.rootEl)
      }
    }
  }

  /**
   * Destroys the panel by unmounting Preact root and removing DOM element.
   * @private
   */
  private destroyPanel(): void {
    if (this.rootEl) {
      // Unmount Preact root
      render(null, this.rootEl)

      // Remove DOM element
      this.rootEl.remove()
      this.rootEl = null
    }
  }

  /**
   * Gets the current reference count (useful for debugging)
   */
  getRefCount(): number {
    return this.refCount
  }

  /**
   * Checks if the panel is initialized (useful for debugging)
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Marks that an explicit <Flux> component is in the tree
   */
  setExplicitPanel(isExplicit: boolean): void {
    this.explicitPanelInTree = isExplicit
    // If an explicit panel is added and we have an auto-created one, remove it
    if (isExplicit && this.initialized) {
      this.destroyPanel()
      this.initialized = false
    }
  }
}

// Singleton instance for managing the global panel lifecycle
const panelLifecycle = new PanelLifecycle()

type FluxProps = Omit<Partial<FluxRootProps>, 'store'> & { isRoot?: boolean }

/**
 * Used to pass custom props to the global panel.
 *
 * @example
 * <Flux fill titleBar={{ drag: false }} />
 *
 */
export function Flux({ isRoot = false, ...props }: FluxProps) {
  useEffect(() => {
    // When an explicit <Flux> component is rendered (not the auto-created root),
    // we need to signal to the panel lifecycle to prevent creating duplicate panels
    if (!isRoot) {
      panelLifecycle.setExplicitPanel(true)
      return () => {
        panelLifecycle.setExplicitPanel(false)
      }
    }
  }, [isRoot])

  return <FluxRoot store={fluxStore} {...props} />
}

/**
 * This hook is used by Flux useControls, and ensures that we spawn a Flux Panel
 * without the user having to put it into the component tree. This should only
 * happen when using the global store.
 * @param isGlobalPanel - Whether this is a global panel instance
 */
export function useRenderRoot(isGlobalPanel: boolean) {
  useEffect(() => {
    if (isGlobalPanel) {
      panelLifecycle.mount()

      return () => {
        panelLifecycle.unmount()
      }
    }
  }, [isGlobalPanel])
}
