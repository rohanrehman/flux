/** @jsxImportSource @madenowhere/phaze */
import { signal, computed } from '@madenowhere/phaze'
import { mergeRefs, useDrag, type DragState } from '@rohanrehman/flux/plugin'
import { useMeasure } from './useMeasure'
import { useRange, useInvertedRange } from './bezier-utils'
import { Svg } from './StyledBezier'
import type { Bezier as BezierType, BezierProps } from './bezier-types'

const HANDLE_RADIUS = 4

interface LineProps {
  sx: number
  sy: number
  cx: number
  cy: number
}

function Line({ sx, sy, cx, cy }: LineProps) {
  const a = Math.atan2(cy - sy, cx - sx)
  const cxs = cx - HANDLE_RADIUS * Math.cos(a)
  const cys = cy - HANDLE_RADIUS * Math.sin(a)

  return <line x1={cxs} y1={cys} x2={sx} y2={sy} />
}

export function BezierSvg({
  displayValue,
  onUpdate,
  withPreview,
}: Pick<BezierProps, 'displayValue' | 'onUpdate'> & { withPreview: boolean }) {
  const r = useRange()
  const ir = useInvertedRange()
  const [measureRef, size] = useMeasure<SVGSVGElement>()
  const svgRef = signal<SVGSVGElement>()
  const handleLeft = signal<SVGCircleElement>()
  const handleRight = signal<SVGCircleElement>()
  // Drag bounds — phaze components run once, so a plain mutable local
  // persists for the row's lifetime (Pattern 5).
  let bounds: DOMRect | undefined

  const bind = useDrag((state: DragState) => {
    const {
      xy: [x, y],
      event,
      first,
      memo,
    } = state
    let currentMemo = memo as number | undefined

    if (first) {
      const svg = svgRef()
      if (!svg) return memo
      bounds = svg.getBoundingClientRect()
      currentMemo = [handleLeft(), handleRight()].indexOf(event!.target as any)
      if (currentMemo < 0) currentMemo = x - bounds.left < size().width / 2 ? 0 : 1
      currentMemo *= 2
    }

    if (!bounds) return memo
    const { width, height } = size()
    const relX = x - bounds.left
    const relY = y - bounds.top

    onUpdate((v: BezierType) => {
      const newV = [...v]
      newV[currentMemo!] = ir(relX, width)
      newV[currentMemo! + 1] = 1 - ir(relY, height)
      return newV
    })

    return currentMemo
  })

  const { x1, y1, x2, y2 } = displayValue

  // Reactive geometry — recomputes when size() changes.
  const geom = computed(() => {
    const { width, height } = size()
    return {
      sx: r(0, width),
      sy: r(1, height),
      ex: r(1, width),
      ey: r(0, height),
      cx1: r(x1, width),
      cy1: r(1 - y1, height),
      cx2: r(x2, width),
      cy2: r(1 - y2, height),
    }
  })

  return (
    <Svg innerRef={mergeRefs([svgRef, measureRef])} {...bind()} withPreview={withPreview}>
      <line x1={() => geom().sx} y1={() => geom().sy} x2={() => geom().ex} y2={() => geom().ey} />
      <path
        fill="none"
        d={() => {
          const g = geom()
          return `M${g.sx},${g.sy} C${g.cx1},${g.cy1} ${g.cx2},${g.cy2} ${g.ex},${g.ey}`
        }}
        strokeLinecap="round"
      />
      <g>
        {() => {
          const g = geom()
          return <Line sx={g.sx} sy={g.sy} cx={g.cx1} cy={g.cy1} />
        }}
        <circle ref={handleLeft as any} cx={() => geom().cx1} cy={() => geom().cy1} r={HANDLE_RADIUS} />
      </g>
      <g>
        {() => {
          const g = geom()
          return <Line sx={g.ex} sy={g.ey} cx={g.cx2} cy={g.cy2} />
        }}
        <circle ref={handleRight as any} cx={() => geom().cx2} cy={() => geom().cy2} r={HANDLE_RADIUS} />
      </g>
    </Svg>
  )
}
