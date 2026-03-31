import { useRef, useCallback } from 'preact/hooks'

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
  // Keep handler and config fresh without recreating event handlers on every render
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  const configRef = useRef(config)
  configRef.current = config

  // All mutable drag state in one ref — no stale closure risk
  const g = useRef({
    active: false,
    started: false,
    startXY: [0, 0] as [number, number],
    lastXY: [0, 0] as [number, number],
    offset: [0, 0] as [number, number], // persists between drag sessions
    from: [0, 0] as [number, number],   // resolved at drag start
    memo: undefined as any,
  })

  const onPointerDown = useCallback((e: PointerEvent) => {
    const { filterTaps = false, from } = configRef.current
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)

    g.current.active = true
    g.current.started = false
    g.current.memo = undefined
    g.current.startXY = [e.clientX, e.clientY]
    g.current.lastXY = [e.clientX, e.clientY]
    g.current.from = from
      ? from({ offset: g.current.offset })
      : ([...g.current.offset] as [number, number])

    if (!filterTaps) {
      g.current.started = true
      g.current.memo = handlerRef.current({
        first: true, last: false, active: true,
        delta: [0, 0], movement: [0, 0],
        xy: [e.clientX, e.clientY],
        offset: [...g.current.from] as [number, number],
        event: e, memo: undefined,
      })
    }
  }, [])

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!g.current.active) return

    const mx = e.clientX - g.current.startXY[0]
    const my = e.clientY - g.current.startXY[1]
    const dx = e.clientX - g.current.lastXY[0]
    const dy = e.clientY - g.current.lastXY[1]
    g.current.lastXY = [e.clientX, e.clientY]

    const offset: [number, number] = [g.current.from[0] + mx, g.current.from[1] + my]

    if (!g.current.started) {
      if (Math.abs(mx) < TAP_THRESHOLD && Math.abs(my) < TAP_THRESHOLD) return
      g.current.started = true
      g.current.memo = handlerRef.current({
        first: true, last: false, active: true,
        delta: [mx, my], movement: [mx, my],
        xy: [e.clientX, e.clientY],
        offset, event: e, memo: undefined,
      })
      return
    }

    g.current.memo = handlerRef.current({
      first: false, last: false, active: true,
      delta: [dx, dy], movement: [mx, my],
      xy: [e.clientX, e.clientY],
      offset, event: e, memo: g.current.memo,
    })
  }, [])

  const onPointerUp = useCallback((e: PointerEvent) => {
    if (!g.current.active) return
    g.current.active = false

    if (!g.current.started) return // tap — no drag fired

    const mx = e.clientX - g.current.startXY[0]
    const my = e.clientY - g.current.startXY[1]
    const dx = e.clientX - g.current.lastXY[0]
    const dy = e.clientY - g.current.lastXY[1]
    const offset: [number, number] = [g.current.from[0] + mx, g.current.from[1] + my]
    g.current.offset = offset // persist for next drag session

    handlerRef.current({
      first: false, last: true, active: false,
      delta: [dx, dy], movement: [mx, my],
      xy: [e.clientX, e.clientY],
      offset, event: e, memo: g.current.memo,
    })
    g.current.memo = undefined
  }, [])

  return useCallback(
    () => ({ onPointerDown, onPointerMove, onPointerUp }),
    [onPointerDown, onPointerMove, onPointerUp]
  )
}
