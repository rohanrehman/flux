/** @jsxImportSource @madenowhere/phaze */
import { signal, effect, cleanup } from '@madenowhere/phaze'
import { colord } from 'colord'
import { Canvas } from './StyledMonitor'
import { Label, Row } from '../UI'
import { range } from '../../utils'
import { useCanvas2d } from '../../hooks'
import { useTh } from '../../styles'
import type { MonitorInput } from '../../types'

type MonitorProps = { label: string } & Omit<MonitorInput, 'type'>
type HandleRef = { current: { frame: (val: any) => void } | null }
type ObjectProps = { initialValue: any; handleRef: HandleRef }

const POINTS = 100

function push(arr: any[], val: any) {
  arr.push(val)
  if (arr.length > POINTS) arr.shift()
}

function MonitorCanvas({ initialValue, handleRef }: ObjectProps) {
  // Theme reads happen once at row mount — themes don't change mid-panel.
  const accentColor = useTh('colors', 'highlight4')
  const backgroundColor = useTh('colors', 'elevation2')
  const fillColor = useTh('colors', 'highlight1')
  const lineWidth = parseFloat(useTh('borderWidths', 'graphLine'))
  const shadowWidth = parseFloat(useTh('borderWidths', 'graphShadow'))

  const gradientTop = colord(fillColor).alpha(0.4).toRgbString()
  const gradientBottom = colord(fillColor).alpha(0.1).toRgbString()

  // Mutable trace state — phaze components run once so plain locals
  // persist for the row's lifetime (Pattern 5).
  const points: any[] = [initialValue]
  let min = initialValue
  let max = initialValue
  let raf: number | undefined

  const drawPlot = (_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D) => {
    if (!_canvas || !_ctx) return
    const { width, height } = _canvas

    const path = new Path2D()
    const interval = width / POINTS
    const verticalPadding = height * 0.05
    for (let i = 0; i < points.length; i++) {
      const p = range(points[i], min!, max!)
      const x = interval * i
      const y = height - p * (height - verticalPadding * 2) - verticalPadding
      path.lineTo(x, y)
    }

    _ctx.clearRect(0, 0, width, height)

    const gradientPath = new Path2D(path)
    gradientPath.lineTo(interval * (points.length + 1), height)
    gradientPath.lineTo(0, height)
    gradientPath.lineTo(0, 0)
    const gradient = _ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0.0, gradientTop)
    gradient.addColorStop(1.0, gradientBottom)
    _ctx.fillStyle = gradient
    _ctx.fill(gradientPath)

    _ctx.strokeStyle = backgroundColor
    _ctx.lineJoin = 'round'
    _ctx.lineWidth = shadowWidth
    _ctx.stroke(path)

    _ctx.strokeStyle = accentColor
    _ctx.lineWidth = lineWidth
    _ctx.stroke(path)
  }

  const [canvas, ctx] = useCanvas2d(drawPlot)

  // Wire the external handle into a frame callback. Effect runs once
  // at scope creation; cleanup detaches the handle on unmount.
  effect(() => {
    handleRef.current = {
      frame: (val: any) => {
        if (min === undefined || val < min) min = val
        if (max === undefined || val > max) max = val
        push(points, val)
        const c = canvas()
        const c2d = ctx()
        if (c && c2d) raf = requestAnimationFrame(() => drawPlot(c, c2d))
      },
    }
    cleanup(() => {
      handleRef.current = null
      if (raf !== undefined) cancelAnimationFrame(raf)
    })
  })

  return <Canvas innerRef={canvas} />
}

const parse = (val: any) => (Number.isFinite(val) ? val.toPrecision(2) : val.toString())

function MonitorLog({ initialValue, handleRef }: ObjectProps) {
  const val = signal(parse(initialValue))
  effect(() => {
    handleRef.current = { frame: (v: any) => val.set(parse(v)) }
    cleanup(() => {
      handleRef.current = null
    })
  })
  return <div>{() => val()}</div>
}

function getValue(o: { current: any } | Function) {
  return typeof o === 'function' ? o() : o.current
}

export function Monitor({ label, objectOrFn, settings }: MonitorProps) {
  const ref: HandleRef = { current: null }
  const initialValue = getValue(objectOrFn)

  effect(() => {
    const timeout = window.setInterval(() => {
      if (document.hidden) return // prevent drawing when document is hidden
      ref.current?.frame(getValue(objectOrFn))
    }, settings.interval)
    cleanup(() => window.clearInterval(timeout))
  })

  return (
    <Row input>
      <Label align="top">{label}</Label>
      {settings.graph ? (
        <MonitorCanvas handleRef={ref} initialValue={initialValue} />
      ) : (
        <MonitorLog handleRef={ref} initialValue={initialValue} />
      )}
    </Row>
  )
}
