/** @jsxImportSource @madenowhere/phaze */
import { signal } from '@madenowhere/phaze'
import { RangeWrapper, Range, Scrubber, Indicator } from './StyledRange'
import { sanitizeStep } from './number-plugin'
import { useDrag } from '../../hooks'
import { invertedRange, range } from '../../utils'
import { useTh } from '../../styles'
import type { RangeSliderProps } from './number-types'

export function RangeSlider({ value, min, max, onDrag, step, initialValue }: RangeSliderProps) {
  const ref = signal<HTMLDivElement>()
  const scrubberRef = signal<HTMLDivElement>()
  let rangeWidth = 0
  const scrubberWidth = useTh('sizes', 'scrubberWidth')

  const bind = useDrag(({ event, first, xy: [x], movement: [mx], memo }) => {
    if (first) {
      // rangeWidth is the width of the slider el minus the width of the scrubber el itself
      const el = ref()
      if (!el) return memo
      const { width, left } = el.getBoundingClientRect()
      rangeWidth = width - parseFloat(scrubberWidth)

      const targetIsScrub = event?.target === scrubberRef()
      // memo is the value where the user clicked
      memo = targetIsScrub ? value : invertedRange((x - left) / width, min, max)
    }
    const newValue = memo + invertedRange(mx / rangeWidth, 0, max - min)
    onDrag(sanitizeStep(newValue, { step, initialValue }))
    return memo
  })

  const pos = range(value, min, max)

  return (
    <RangeWrapper innerRef={ref} {...bind()}>
      <Range>
        <Indicator style={{ left: 0, right: `${(1 - pos) * 100}%` }} />
      </Range>
      <Scrubber innerRef={scrubberRef} style={{ left: `calc(${pos} * (100% - ${scrubberWidth}))` }} />
    </RangeWrapper>
  )
}
