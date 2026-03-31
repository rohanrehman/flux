import { useRef, useCallback } from 'preact/hooks'

export type MoveState = {
  xy: [number, number]
  first: boolean
}

export function usePointerMove(handler: (state: MoveState) => void) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  const active = useRef(false)

  const onPointerEnter = useCallback((e: PointerEvent) => {
    active.current = true
    handlerRef.current({ xy: [e.clientX, e.clientY], first: true })
  }, [])

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!active.current) return
    handlerRef.current({ xy: [e.clientX, e.clientY], first: false })
  }, [])

  const onPointerLeave = useCallback(() => {
    active.current = false
  }, [])

  return useCallback(
    () => ({ onPointerEnter, onPointerMove, onPointerLeave }),
    [onPointerEnter, onPointerMove, onPointerLeave]
  )
}
