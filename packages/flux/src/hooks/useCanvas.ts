import { useEffect, useRef } from 'preact/hooks'
import type { RefObject } from 'preact'
import { debounce } from '../utils'

export function useCanvas2d(
  fn: Function
): [RefObject<HTMLCanvasElement | null>, RefObject<CanvasRenderingContext2D | null>] {
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const ctx = useRef<CanvasRenderingContext2D | null>(null)
  const hasFired = useRef(false)

  useEffect(() => {
    const handleCanvas = debounce(() => {
      if (!canvas.current) return
      canvas.current.width = canvas.current.offsetWidth * window.devicePixelRatio
      canvas.current.height = canvas.current.offsetHeight * window.devicePixelRatio
      ctx.current = canvas.current.getContext('2d')
      fn(canvas.current, ctx.current)
    }, 250)
    window.addEventListener('resize', handleCanvas)
    if (!hasFired.current) {
      handleCanvas()
      hasFired.current = true
    }
    return () => window.removeEventListener('resize', handleCanvas)
  }, [fn])

  return [canvas, ctx]
}
