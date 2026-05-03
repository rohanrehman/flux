import { signal, effect, cleanup } from '@madenowhere/phaze'
import type { Signal } from '@madenowhere/phaze'
import { debounce } from '../utils'

/**
 * Canvas + 2D context refs paired with a resize-aware redraw loop.
 *
 * Phaze migration: refs are signals so consumers can pass them directly to
 * `<canvas ref={canvas} />`; the effect runs once at scope creation and
 * re-fires whenever the canvas element is wired (signal change). Cleanup
 * detaches the resize listener.
 */
export function useCanvas2d(
  fn: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void
): [Signal<HTMLCanvasElement | undefined>, Signal<CanvasRenderingContext2D | undefined>] {
  const canvas = signal<HTMLCanvasElement>()
  const ctx = signal<CanvasRenderingContext2D | undefined>()
  let hasFired = false

  effect(() => {
    const el = canvas()
    if (!el) return

    const handleCanvas = debounce(() => {
      el.width = el.offsetWidth * window.devicePixelRatio
      el.height = el.offsetHeight * window.devicePixelRatio
      const c = el.getContext('2d')
      ctx.set(c ?? undefined)
      if (c) fn(el, c)
    }, 250)

    window.addEventListener('resize', handleCanvas)
    if (!hasFired) {
      handleCanvas()
      hasFired = true
    }
    cleanup(() => window.removeEventListener('resize', handleCanvas))
  })

  return [canvas, ctx as Signal<CanvasRenderingContext2D | undefined>]
}
