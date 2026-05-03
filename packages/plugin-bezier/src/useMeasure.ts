import { signal, effect, cleanup } from '@madenowhere/phaze'
import type { Signal } from '@madenowhere/phaze'

/**
 * Phaze-native replacement for `react-use-measure`. Returns a ref signal
 * + a size signal that tracks the element's bounding box via
 * ResizeObserver.
 *
 * Usage:
 *   const [ref, size] = useMeasure<HTMLDivElement>()
 *   <div ref={ref} />
 *   const { width, height } = size()  // reactive
 */
export function useMeasure<T extends Element>(): [
  Signal<T | undefined>,
  Signal<{ width: number; height: number }>
] {
  const ref = signal<T>()
  const size = signal({ width: 0, height: 0 })

  effect(() => {
    const el = ref()
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      size.set({ width, height })
    })
    observer.observe(el)

    // Seed with the current size so consumers don't read 0/0 on the
    // first run (ResizeObserver fires asynchronously).
    const rect = el.getBoundingClientRect()
    size.set({ width: rect.width, height: rect.height })

    cleanup(() => observer.disconnect())
  })

  return [ref, size]
}
