// Phaze migration: useRef-only hook collapses entirely to plain locals
// since phaze components run once. The mutable drag state, handler ref,
// and config ref all become module-scope-style locals (Pattern 5).

export type DragState = {
  first: boolean
  last: boolean
  active: boolean
  delta: [number, number]
  movement: [number, number]
  xy: [number, number]
  offset: [number, number]
  event: PointerEvent
  memo: any
}

export type DragConfig = {
  filterTaps?: boolean
  from?: (state: { offset: [number, number] }) => [number, number]
}

const TAP_THRESHOLD = 3

export function useRawDrag(handler: (state: DragState) => any, config: DragConfig = {}) {
  // All mutable drag state in one bag — closures over these locals are
  // stable for the scope's lifetime since phaze components run once.
  const g = {
    active: false,
    started: false,
    startXY: [0, 0] as [number, number],
    lastXY: [0, 0] as [number, number],
    offset: [0, 0] as [number, number], // persists between drag sessions
    from: [0, 0] as [number, number], // resolved at drag start
    memo: undefined as any,
  }

  const onPointerDown = (e: PointerEvent) => {
    const { filterTaps = false, from } = config
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)

    g.active = true
    g.started = false
    g.memo = undefined
    g.startXY = [e.clientX, e.clientY]
    g.lastXY = [e.clientX, e.clientY]
    g.from = from
      ? from({ offset: g.offset })
      : ([...g.offset] as [number, number])

    if (!filterTaps) {
      g.started = true
      g.memo = handler({
        first: true, last: false, active: true,
        delta: [0, 0], movement: [0, 0],
        xy: [e.clientX, e.clientY],
        offset: [...g.from] as [number, number],
        event: e, memo: undefined,
      })
    }
  }

  const onPointerMove = (e: PointerEvent) => {
    if (!g.active) return

    const mx = e.clientX - g.startXY[0]
    const my = e.clientY - g.startXY[1]
    const dx = e.clientX - g.lastXY[0]
    const dy = e.clientY - g.lastXY[1]
    g.lastXY = [e.clientX, e.clientY]

    const offset: [number, number] = [g.from[0] + mx, g.from[1] + my]

    if (!g.started) {
      if (Math.abs(mx) < TAP_THRESHOLD && Math.abs(my) < TAP_THRESHOLD) return
      g.started = true
      g.memo = handler({
        first: true, last: false, active: true,
        delta: [mx, my], movement: [mx, my],
        xy: [e.clientX, e.clientY],
        offset, event: e, memo: undefined,
      })
      return
    }

    g.memo = handler({
      first: false, last: false, active: true,
      delta: [dx, dy], movement: [mx, my],
      xy: [e.clientX, e.clientY],
      offset, event: e, memo: g.memo,
    })
  }

  const onPointerUp = (e: PointerEvent) => {
    if (!g.active) return
    g.active = false

    if (!g.started) return // tap — no drag fired

    const mx = e.clientX - g.startXY[0]
    const my = e.clientY - g.startXY[1]
    const dx = e.clientX - g.lastXY[0]
    const dy = e.clientY - g.lastXY[1]
    const offset: [number, number] = [g.from[0] + mx, g.from[1] + my]
    g.offset = offset // persist for next drag session

    handler({
      first: false, last: true, active: false,
      delta: [dx, dy], movement: [mx, my],
      xy: [e.clientX, e.clientY],
      offset, event: e, memo: g.memo,
    })
    g.memo = undefined
  }

  return () => ({ onPointerDown, onPointerMove, onPointerUp })
}
