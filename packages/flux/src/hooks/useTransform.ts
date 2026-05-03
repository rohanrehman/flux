import { signal } from '@madenowhere/phaze'
import type { Signal } from '@madenowhere/phaze'

/**
 * Imperative transform helper for the panel's drag-bar (and similar). Returns
 * a signal-as-ref and a setter that writes a CSS `translate3d` to the
 * element when it lands. Phaze migration: the ref is a Signal<T>, not a
 * preact RefObject; consumers should pass it directly to the element via
 * `<el ref={ref} />` (phaze auto-wires signal.set on mount).
 *
 * The position is held in a plain local — components run once, so the
 * closure persists for the lifetime of the scope.
 */
export function useTransform<T extends HTMLElement>(): [
  Signal<T | undefined>,
  (point: { x?: number; y?: number }) => void
] {
  const nodeRef = signal<T>()
  const local = { x: 0, y: 0 }

  const set = (point: { x?: number; y?: number }) => {
    Object.assign(local, point)
    const el = nodeRef()
    if (el) {
      el.style.transform = `translate3d(${local.x}px, ${local.y}px, 0)`
    }
  }

  return [nodeRef, set]
}
