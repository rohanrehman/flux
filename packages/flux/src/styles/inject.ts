// @ts-ignore — CSS loaded as raw text via esbuild text loader
import css from './flux.core.css'

const STYLE_ID = '__flux'

function injectStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = css as unknown as string
  document.head.appendChild(el)
}

injectStyles()

// Re-inject after Astro view transitions swap the DOM
if (typeof document !== 'undefined') {
  document.addEventListener('astro:after-swap', injectStyles)
}
