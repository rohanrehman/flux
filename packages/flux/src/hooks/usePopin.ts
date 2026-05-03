import { signal, effect } from '@madenowhere/phaze'
import type { Signal } from '@madenowhere/phaze'

/**
 * Popover positioning helper. Returns trigger + wrapper refs (signals)
 * plus a reactive `shown` accessor and show/hide imperatives.
 *
 * Phaze migration: useState→signal, useRef<HTMLDivElement>→signal<T>,
 * useLayoutEffect→effect (runs synchronously at scope creation, re-runs
 * when its tracked deps change — here `shown()` and the refs).
 */
export function usePopin(margin = 3) {
  const popinRef: Signal<HTMLDivElement | undefined> = signal()
  const wrapperRef: Signal<HTMLDivElement | undefined> = signal()

  const shown = signal(false)

  const show = () => shown.set(true)
  const hide = () => shown.set(false)

  effect(() => {
    if (!shown()) return
    const popin = popinRef()
    const wrapper = wrapperRef()
    if (!popin || !wrapper) return

    const { bottom, top, left } = popin.getBoundingClientRect()
    const { height } = wrapper.getBoundingClientRect()
    const direction = bottom + height > window.innerHeight - 40 ? 'up' : 'down'

    wrapper.style.position = 'fixed'
    wrapper.style.zIndex = '10000'
    wrapper.style.left = left + 'px'

    if (direction === 'down') wrapper.style.top = bottom + margin + 'px'
    else wrapper.style.bottom = window.innerHeight - top + margin + 'px'
  })

  return { popinRef, wrapperRef, shown, show, hide }
}
