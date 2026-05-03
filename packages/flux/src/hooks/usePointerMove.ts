// Phaze migration: components run once, so handler/state refs collapse
// to plain locals; useCallback ceremony disappears (Patterns 3, 5).

export type MoveState = {
  xy: [number, number]
  first: boolean
}

export function usePointerMove(handler: (state: MoveState) => void) {
  let active = false

  const onPointerEnter = (e: PointerEvent) => {
    active = true
    handler({ xy: [e.clientX, e.clientY], first: true })
  }

  const onPointerMove = (e: PointerEvent) => {
    if (!active) return
    handler({ xy: [e.clientX, e.clientY], first: false })
  }

  const onPointerLeave = () => {
    active = false
  }

  return () => ({ onPointerEnter, onPointerMove, onPointerLeave })
}
