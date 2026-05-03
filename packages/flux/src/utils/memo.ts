// Phaze migration: memo() is a no-op pass-through. Phaze components run
// once at mount — there's no re-render to skip. Call sites can be deleted
// over time; keeping the export so the migration doesn't have to touch
// every consumer at once.
import type { Component, JSXChild } from '@madenowhere/phaze'

export function memo<C extends (props: any) => JSXChild | Component<any>>(
  Comp: C,
  _compare?: (prev: any, next: any) => boolean
): C {
  return Comp
}
