import { useRef, useState, useCallback, useEffect } from 'preact/hooks'
import { colord } from 'colord'
import type { ComponentChildren } from 'preact'

export type RgbColor = { r: number; g: number; b: number }
export type RgbaColor = { r: number; g: number; b: number; a: number }

type HsvaColor = { h: number; s: number; v: number; a: number }

function toHsva({ r, g, b, a = 1 }: RgbaColor): HsvaColor {
  const hsv = colord({ r, g, b, a }).toHsv()
  return { h: hsv.h, s: hsv.s / 100, v: hsv.v / 100, a }
}

function fromHsva({ h, s, v, a }: HsvaColor): RgbaColor {
  const { r, g, b } = colord({ h, s: s * 100, v: v * 100, a }).toRgb()
  return { r, g, b, a: Math.round(a * 100) / 100 }
}

function equalRgba(a: RgbaColor, b: RgbaColor) {
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

function useColorState(color: RgbaColor, onChange: (c: RgbaColor) => void) {
  const [hsva, setHsva] = useState<HsvaColor>(() => toHsva(color))
  const cache = useRef({ color, hsva: toHsva(color) })

  useEffect(() => {
    if (!equalRgba(color, cache.current.color)) {
      const next = toHsva(color)
      cache.current = { color, hsva: next }
      setHsva(next)
    }
  }, [color])

  const update = useCallback(
    (partial: Partial<HsvaColor>) => {
      setHsva((prev) => {
        const next = { ...prev, ...partial }
        const rgba = fromHsva(next)
        cache.current = { color: rgba, hsva: next }
        onChange(rgba)
        return next
      })
    },
    [onChange]
  )

  return [hsva, update] as const
}

function Interactive({
  onMove,
  children,
}: {
  onMove: (x: number, y: number) => void
  children?: ComponentChildren
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const dragging = useRef(false)

  const getPos = useCallback(
    (e: PointerEvent) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      onMove(clamp01((e.clientX - rect.left) / rect.width), clamp01((e.clientY - rect.top) / rect.height))
    },
    [onMove]
  )

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      dragging.current = true
      ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
      getPos(e)
    },
    [getPos]
  )

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (dragging.current) getPos(e)
    },
    [getPos]
  )

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  return (
    <div
      ref={ref}
      class="react-colorful__interactive"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}>
      {children}
    </div>
  )
}

function Pointer({ left, top, color }: { left: number; top: number; color: string }) {
  return (
    <div class="react-colorful__pointer" style={{ top: `${top * 100}%`, left: `${left * 100}%` }}>
      <div class="react-colorful__pointer-fill" style={{ backgroundColor: color }} />
    </div>
  )
}

function Saturation({ hsva, onChange }: { hsva: HsvaColor; onChange: (v: Partial<HsvaColor>) => void }) {
  const onMove = useCallback((x: number, y: number) => onChange({ s: x, v: 1 - y }), [onChange])
  const bgColor = colord({ h: hsva.h, s: 100, v: 100 }).toHslString()
  const pointerColor = colord({ h: hsva.h, s: hsva.s * 100, v: hsva.v * 100 }).toHslString()
  return (
    <div class="react-colorful__saturation" style={{ backgroundColor: bgColor }}>
      <Interactive onMove={onMove}>
        <Pointer left={hsva.s} top={1 - hsva.v} color={pointerColor} />
      </Interactive>
    </div>
  )
}

function Hue({
  hue,
  onChange,
  className,
}: {
  hue: number
  onChange: (v: Partial<HsvaColor>) => void
  className?: string
}) {
  const onMove = useCallback((x: number) => onChange({ h: x * 360 }), [onChange])
  const pointerColor = colord({ h: hue, s: 100, v: 100 }).toHslString()
  return (
    <div class={`react-colorful__hue${className ? ` ${className}` : ''}`}>
      <Interactive onMove={(x) => onMove(x)}>
        <Pointer left={hue / 360} top={0.5} color={pointerColor} />
      </Interactive>
    </div>
  )
}

function Alpha({
  hsva,
  onChange,
  className,
}: {
  hsva: HsvaColor
  onChange: (v: Partial<HsvaColor>) => void
  className?: string
}) {
  const onMove = useCallback((x: number) => onChange({ a: x }), [onChange])
  const { r, g, b } = colord({ h: hsva.h, s: hsva.s * 100, v: hsva.v * 100 }).toRgb()
  const gradient = `linear-gradient(to right, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1))`
  const pointerColor = `rgba(${r},${g},${b},${hsva.a})`
  return (
    <div class={`react-colorful__alpha${className ? ` ${className}` : ''}`}>
      <div class="react-colorful__alpha-gradient" style={{ background: gradient }} />
      <Interactive onMove={(x) => onMove(x)}>
        <Pointer left={hsva.a} top={0.5} color={pointerColor} />
      </Interactive>
    </div>
  )
}

export function RgbColorPicker({ color, onChange }: { color: RgbColor; onChange: (c: RgbColor) => void }) {
  const rgba: RgbaColor = { ...color, a: 1 }
  const [hsva, update] = useColorState(rgba, ({ r, g, b }) => onChange({ r, g, b }))
  return (
    <div class="react-colorful">
      <Saturation hsva={hsva} onChange={update} />
      <Hue hue={hsva.h} onChange={update} className="react-colorful__last-control" />
    </div>
  )
}

export function RgbaColorPicker({ color, onChange }: { color: RgbaColor; onChange: (c: RgbaColor) => void }) {
  const [hsva, update] = useColorState(color, onChange)
  return (
    <div class="react-colorful">
      <Saturation hsva={hsva} onChange={update} />
      <Hue hue={hsva.h} onChange={update} />
      <Alpha hsva={hsva} onChange={update} className="react-colorful__last-control" />
    </div>
  )
}
