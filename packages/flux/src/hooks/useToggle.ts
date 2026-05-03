import { signal, effect, cleanup } from '@madenowhere/phaze'
import type { Signal } from '@madenowhere/phaze'

/**
 * Smooth collapse/expand animation for toggleable content. Returns
 * wrapper + content refs (signals); attach via `<div ref={wrapperRef}>`.
 *
 * Phaze migration: `toggled` is now a thunk so the hook can subscribe
 * to changes (phaze components run once — a plain boolean would be
 * captured at first call only). Effect runs when `toggled()` flips OR
 * when wrapperRef lands; first refer-set is treated as initial mount
 * (no animation, just a height/overflow seed if collapsed).
 */
export function useToggle(toggled: () => boolean): {
  wrapperRef: Signal<HTMLDivElement | undefined>
  contentRef: Signal<HTMLDivElement | undefined>
} {
  const wrapperRef: Signal<HTMLDivElement | undefined> = signal()
  const contentRef: Signal<HTMLDivElement | undefined> = signal()
  let firstRun = true

  effect(() => {
    const isToggled = toggled()
    const ref = wrapperRef()
    const content = contentRef()
    if (!ref || !content) return

    if (firstRun) {
      // Initial: collapse without animation if already toggled-off.
      if (!isToggled) {
        ref.style.height = '0px'
        ref.style.overflow = 'hidden'
      }
      firstRun = false
      return
    }

    let timeout: number | undefined

    const fixHeight = () => {
      if (toggled()) {
        ref.style.removeProperty('height')
        ref.style.removeProperty('overflow')
        contentRef()?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }

    ref.addEventListener('transitionend', fixHeight, { once: true })

    const { height } = content.getBoundingClientRect()
    ref.style.height = height + 'px'
    if (!isToggled) {
      ref.style.overflow = 'hidden'
      timeout = window.setTimeout(() => (ref.style.height = '0px'), 50)
    }

    cleanup(() => {
      ref.removeEventListener('transitionend', fixHeight)
      if (timeout !== undefined) clearTimeout(timeout)
    })
  })

  return { wrapperRef, contentRef }
}
