/** @jsxImportSource @madenowhere/phaze */
import { signal, effect } from '@madenowhere/phaze'
import { debounce } from '@rohanrehman/flux/plugin'
import { PreviewSvg } from './StyledBezier'
import type { BezierProps } from './bezier-types'

function StaticBezierPreview({ value }: Pick<BezierProps, 'value'>) {
  // forceUpdate via a counter signal — bumping it remounts the dots so
  // the CSS animations restart from the top of their timeline.
  const tick = signal(0)
  const forceUpdate = () => tick.set(tick() + 1)

  const plotPoints = Array(21)
    .fill(0)
    .map((_, i) => 5 + value.evaluate(i / 20) * 90)

  return (
    <PreviewSvg onClick={forceUpdate}>
      {() =>
        plotPoints.map((p, i) => (
          // The Date.now() in the key is intentional — keying on time
          // forces the animation to restart on each `tick` bump.
          <circle
            key={i + Date.now() + tick()}
            r={3}
            cx={`${p}%`}
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))
      }
      {() => (
        <circle
          key={Date.now() - 1 + tick()}
          r={3}
          style={{
            animationTimingFunction: `cubic-bezier(${value.join(',')})`,
            animationDuration: `${plotPoints.length * 50}ms`,
          }}
        />
      )}
    </PreviewSvg>
  )
}

export function BezierPreview({ value }: Pick<BezierProps, 'value'>) {
  // Debounce incoming value changes to ~250ms before updating the
  // preview — same UX as the preact version, just signal-driven now.
  const debouncedValue = signal(value)
  const updateDebounced = debounce((v: typeof value) => debouncedValue.set(v), 250)

  effect(() => {
    updateDebounced(value)
  })

  // Reactive read of the debounced value drives the preview.
  return <>{() => <StaticBezierPreview value={debouncedValue()} />}</>
}
