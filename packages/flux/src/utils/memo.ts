import { Component, h } from 'preact'
import type { ComponentType } from 'preact'

function shallowEqual(a: Record<string, unknown>, b: Record<string, unknown>) {
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) return false
  return keys.every((k) => a[k] === b[k])
}

export function memo<P extends object>(
  Comp: ComponentType<P>,
  compare: (prev: P, next: P) => boolean = shallowEqual as any
): ComponentType<P> {
  class Memo extends Component<P> {
    shouldComponentUpdate(next: P) {
      return !compare(this.props, next)
    }
    render() {
      return h(Comp as any, this.props)
    }
  }
  return Memo as unknown as ComponentType<P>
}
