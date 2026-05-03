/** @jsxImportSource @madenowhere/phaze */
import { signal, effect } from '@madenowhere/phaze'
import { animate } from '@madenowhere/photon'
import {
  useCanvas2d,
  useDrag,
  useInputContext,
  debounce,
  colord,
  useTh,
  type DragState,
} from '@rohanrehman/flux/plugin'
import { Canvas, SpringPreview } from './StyledSpring'
import { springFn } from './math'
import type { SpringProps } from './spring-types'

export function SpringCanvas() {
  const { displayValue, value, onUpdate, settings } = useInputContext<SpringProps>()

  // Spring state captured as a plain mutable bag — the drag handler and
  // the redraw callback both read from this so they always see the
  // latest displayValue without needing a useRef indirection.
  const current = { ...displayValue }

  const accentColor = useTh('colors', 'highlight4')
  const backgroundColor = useTh('colors', 'elevation2')
  const fillColor = useTh('colors', 'highlight1')
  const lineWidth = parseFloat(useTh('borderWidths', 'graphLine'))
  const shadowWidth = parseFloat(useTh('borderWidths', 'graphShadow'))

  const gradientTop = colord(fillColor).alpha(0.4).toRgbString()
  const gradientBottom = colord(fillColor).alpha(0.1).toRgbString()

  const { tension: ts, friction: fs } = settings!

  // Phaze migration: useSpring → two signals driven by photon.animate().
  // Photon detects phaze-shaped signals duck-typed (callable +
  // .set/.subscribe) so passing them directly to animate() works.
  const scaleX = signal(0.5)
  const opacity = signal(0.2)

  const bind = useDrag((state: DragState) => {
    const {
      movement: [x, y],
      memo = [current.tension, current.friction],
    } = state
    onUpdate({
      ...value,
      tension: memo[0] - Math.round(x) * ts.step,
      friction: memo[1] - Math.round(y / 4) * fs.step,
    })
    return memo
  })

  // Debounced "kick" — restart the preview animation with the latest
  // spring config. Photon naming maps: tension→stiffness, friction→damping.
  const kickPreview = debounce(() => {
    const { tension, friction, mass } = current
    scaleX.set(0)
    opacity.set(0.9)
    animate(scaleX, 0.5, { stiffness: tension, damping: friction, mass })
    animate(opacity, 0.2, { stiffness: tension, damping: friction, mass })
  }, 250)

  const drawSpring = (_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D) => {
    const { tension, friction, mass } = current
    const { width, height } = _canvas
    const t = springFn(tension, friction, mass)

    const path = new Path2D()
    let max = 0
    for (let i = 0; i < width; i++) {
      const v = (t(i * 8) * height) / 2
      if (Number.isFinite(v)) max = Math.max(max, v)
      path.lineTo(i, height - v)
    }

    _ctx.clearRect(0, 0, width, height)

    const gradientPath = new Path2D(path)
    gradientPath.lineTo(width - 1, height)
    gradientPath.lineTo(0, height)
    const gradient = _ctx.createLinearGradient(0, height / 2, 0, height)
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

  const [canvas, ctx] = useCanvas2d(drawSpring)

  // Whenever displayValue (and therefore the spring config) changes, sync
  // the local state, redraw the static curve, and kick the preview.
  effect(() => {
    current.tension = displayValue.tension
    current.friction = displayValue.friction
    current.mass = displayValue.mass
    const c = canvas()
    const c2d = ctx()
    if (c && c2d) drawSpring(c, c2d)
    kickPreview()
  })

  return (
    <>
      <Canvas {...bind()} innerRef={canvas} />
      <SpringPreview
        style={() => ({
          transform: `scaleX(${scaleX()})`,
          opacity: opacity(),
        })}
      />
    </>
  )
}
