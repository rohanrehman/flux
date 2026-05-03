/** @jsxImportSource @madenowhere/phaze */
import { effect, cleanup, render } from '@madenowhere/phaze'
import { fluxStore } from '../../store'
import { FluxRoot, FluxRootProps } from './FluxRoot'

/**
 * Manages the lifecycle of the global Flux panel, including creation,
 * cleanup, and reference counting to ensure the panel is only removed
 * when no components are using it.
 *
 * Phaze migration: render() takes a thunk in phaze (not a JSX element
 * directly), and there's no equivalent to preact's render(null, root)
 * for unmounting — phaze returns a dispose function from render().
 */
class PanelLifecycle {
  private refCount = 0
  private rootEl: HTMLElement | null = null
  private dispose: (() => void) | null = null
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
   * Creates the panel DOM element and renders into it via phaze.
   * @private
   */
  private createPanel(): void {
    if (!this.rootEl) {
      this.rootEl =
        document.getElementById('flux__root') ||
        Object.assign(document.createElement('div'), { id: 'flux__root' })

      if (document.body) {
        document.body.appendChild(this.rootEl)
        // phaze render() takes a thunk; the returned dispose function
        // tears down the reactive scope on destroyPanel().
        const result = render(() => <Flux isRoot />, this.rootEl)
        this.dispose = typeof result === 'function' ? result : null
      }
    }
  }

  /**
   * Destroys the panel by disposing the phaze scope and removing the DOM
   * element.
   * @private
   */
  private destroyPanel(): void {
    if (this.rootEl) {
      this.dispose?.()
      this.dispose = null
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
  // When an explicit <Flux> component is rendered (not the auto-created
  // root), tell the panel lifecycle so we don't double-mount.
  effect(() => {
    if (!isRoot) {
      panelLifecycle.setExplicitPanel(true)
      cleanup(() => {
        panelLifecycle.setExplicitPanel(false)
      })
    }
  })

  return <FluxRoot store={fluxStore} {...props} />
}

/**
 * Spawns a Flux panel implicitly when useControls is called against the
 * global store. Used by useControls.
 *
 * Phaze migration: lifecycle is wrapped in effect() so the parent
 * component's owner scope tears it down on unmount via cleanup().
 */
export function useRenderRoot(isGlobalPanel: boolean) {
  effect(() => {
    if (isGlobalPanel) {
      panelLifecycle.mount()
      cleanup(() => panelLifecycle.unmount())
    }
  })
}
