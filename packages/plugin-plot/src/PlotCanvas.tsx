/** @jsxImportSource @madenowhere/phaze */
import { signal, effect } from '@madenowhere/phaze'
import {
  useCanvas2d,
  useTh,
  range,
  invertedRange,
  debounce,
  useTransform,
  clamp,
  Components,
  usePointerMove,
} from '@rohanrehman/flux/plugin'
import { Wrapper, Canvas, Dot, ToolTip } from './StyledPlot'
import type { InternalPlot, InternalPlotSettings } from './plot-types'

type PlotCanvasProps = { value: InternalPlot; settings: InternalPlotSettings }

export function PlotCanvas({ value: expr, settings }: PlotCanvasProps) {
  const { boundsX, boundsY } = settings

  const accentColor = useTh('colors', 'highlight4')
  const lineWidth = parseFloat(useTh('borderWidths', 'graphLine'))

  // Mutable plot-state — phaze components run once so plain locals
  // persist for the row's lifetime (Pattern 5).
  let yPositions: number[] = []
  let canvasMinY = -Infinity
  let canvasMaxY = Infinity

  const drawPlot = (_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D) => {
    if (!_canvas || !_ctx) return
    const { width, height } = _canvas

    const points: number[] = []

    // compute the expressions
    const [minX, maxX] = boundsX
    canvasMinY = Infinity
    canvasMaxY = -Infinity
    for (let i = 0; i < width; i++) {
      // map the canvas width to minX/maxX
      const x = invertedRange(range(i, 0, width), minX, maxX)
      const v = expr(x)
      if (v < canvasMinY && v !== -Infinity) canvasMinY = v
      if (v > canvasMaxY && v !== Infinity) canvasMaxY = v
      points.push(v)
    }

    if (boundsY[0] !== -Infinity) canvasMinY = boundsY[0]
    if (boundsY[1] !== Infinity) canvasMaxY = boundsY[1]

    _ctx.clearRect(0, 0, width, height)

    yPositions = []

    const path = new Path2D()
    for (let i = 0; i < width; i++) {
      const v = invertedRange(range(points[i], canvasMinY, canvasMaxY), height - 5, 5)
      yPositions.push(v)
      path.lineTo(i, v)
    }

    _ctx.strokeStyle = accentColor
    _ctx.lineWidth = lineWidth
    _ctx.stroke(path)
  }

  const [canvas, ctx] = useCanvas2d(drawPlot)

  // Debounced redraw — refreshes when the canvas/ctx signal lands or expr changes.
  // Debounced fn is stable for the row's lifetime since we don't re-create it.
  const updatePlot = debounce(() => {
    const c = canvas()
    const c2d = ctx()
    if (c && c2d) drawPlot(c, c2d)
  }, 250)
  effect(() => {
    void canvas()
    void ctx()
    updatePlot()
  })

  const toolTipOpen = signal(false)
  const toolTipValues = signal({ x: '0', y: '0' })

  const [dotRef, set] = useTransform<HTMLDivElement>()
  let canvasBounds: DOMRect | undefined

  const bind = usePointerMove(({ xy: [x], first }) => {
    if (first) {
      const c = canvas()
      if (!c) return
      canvasBounds = c.getBoundingClientRect()
    }
    if (!canvasBounds) return
    const { left, top, width, height } = canvasBounds
    const [minX, maxX] = boundsX
    const i = Math.ceil(x - left)
    const valueX = invertedRange(range(i, 0, width), minX, maxX)
    const rawY = expr(valueX)
    const valueY = isFinite(rawY) ? rawY.toFixed(2) : 'NaN'

    const relY = clamp(yPositions[i * window.devicePixelRatio] / window.devicePixelRatio, 0, height)

    toolTipValues.set({ x: valueX.toFixed(2), y: valueY })
    set({ x: left + i - 3, y: top + relY - 5 + 2 })
  })

  return (
    <Wrapper onMouseEnter={() => toolTipOpen.set(true)} onMouseLeave={() => toolTipOpen.set(false)}>
      <Canvas innerRef={canvas} {...bind()} />
      {() =>
        toolTipOpen() && (
          <Components.Portal>
            <Dot innerRef={dotRef}>
              <ToolTip>
                {() => `x: ${toolTipValues().x}`}
                <br />
                {() => `y: ${toolTipValues().y}`}
              </ToolTip>
            </Dot>
          </Components.Portal>
        )
      }
    </Wrapper>
  )
}
