import { useRef, useCallback } from 'preact/hooks'
import type { RefObject } from 'preact'

export function useTransform<T extends HTMLElement>(): [
  RefObject<T>,
  (point: { x?: number; y?: number }) => void
] {
  const nodeRef = useRef<T | null>(null)
  const local = useRef({ x: 0, y: 0 })

  const set = useCallback((point: { x?: number; y?: number }) => {
    Object.assign(local.current, point)
    if (nodeRef.current) {
      nodeRef.current.style.transform = `translate3d(${local.current.x}px, ${local.current.y}px, 0)`
    }
  }, [])

  return [nodeRef as RefObject<T>, set]
}
