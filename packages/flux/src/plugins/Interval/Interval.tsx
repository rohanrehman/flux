/** @jsxImportSource @madenowhere/phaze */
import { signal } from '@madenowhere/phaze'
import type { Signal } from '@madenowhere/phaze'
import { Label, Row } from '../../components/UI'
import { Vector } from '../Vector'
import { Range, RangeWrapper, Scrubber, Indicator, sanitizeStep } from '../Number'
import { useDrag } from '../../hooks'
import { invertedRange, range } from '../../utils'
import { useInputContext } from '../../context'
import { useTh } from '../../styles'
import type { IntervalSliderProps, IntervalProps, InternalInterval } from './interval-types'

type DivProps = JSX.IntrinsicElements['div']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>
type ContainerProps = DivProps & { ref?: RefLike<HTMLDivElement> }

function Container({ ref, className = '', ...props }: ContainerProps) {
  return <div ref={ref as any} class={`flux-interval-container ${className}`.trim()} {...props} />
}

function IntervalSlider({ value, bounds: [min, max], onDrag, ...settings }: IntervalSliderProps) {
  const ref = signal<HTMLDivElement>()
  const minScrubberRef = signal<HTMLDivElement>()
  const maxScrubberRef = signal<HTMLDivElement>()
  let rangeWidth = 0
  const scrubberWidth = useTh('sizes', 'scrubberWidth')

  // value is a phaze Signal/Computed (the displayValue threaded down
  // from IntervalComponent). Resolve defensively each read so the
  // scrubber positions and drag math reflect live store updates.
  const readValue = (): InternalInterval =>
    typeof value === 'function' ? (value as () => InternalInterval)() : (value as InternalInterval)

  const bind = useDrag(({ event, first, xy: [x], movement: [mx], memo = {} }) => {
    if (first) {
      const el = ref()
      if (!el) return memo
      const { width, left } = el.getBoundingClientRect()
      rangeWidth = width - parseFloat(scrubberWidth)

      const targetIsScrub = event?.target === minScrubberRef() || event?.target === maxScrubberRef()

      const v = readValue()
      memo.pos = invertedRange((x - left) / width, min, max)
      const delta = Math.abs(memo.pos - v.min) - Math.abs(memo.pos - v.max)
      memo.key = delta < 0 || (delta === 0 && memo.pos <= v.min) ? 'min' : 'max'
      if (targetIsScrub) memo.pos = v[memo.key as keyof InternalInterval]
    }
    const newValue = memo.pos + invertedRange(mx / rangeWidth, 0, max - min)

    onDrag({ [memo.key]: sanitizeStep(newValue, settings[memo.key as 'min' | 'max']) })
    return memo
  })

  // Thunked so the indicator + scrubbers track displayValue reactively.
  // Phaze components run once — a literal string here would freeze at
  // initial mount values.
  const minStyle = () => `calc(${range(readValue().min, min, max)} * (100% - ${scrubberWidth} - 8px) + 4px)`
  const maxStyle = () => `calc(${1 - range(readValue().max, min, max)} * (100% - ${scrubberWidth} - 8px) + 4px)`

  return (
    <RangeWrapper innerRef={ref} {...bind()}>
      <Range>
        <Indicator style={() => ({ left: minStyle(), right: maxStyle() })} />
      </Range>
      <Scrubber position="left" innerRef={minScrubberRef} style={() => ({ left: minStyle() })} />
      <Scrubber position="right" innerRef={maxScrubberRef} style={() => ({ right: maxStyle() })} />
    </RangeWrapper>
  )
}

export function IntervalComponent() {
  const { label, displayValue, onUpdate, settings } = useInputContext<IntervalProps>()

  const { bounds: _bounds, ..._settings } = settings

  return (
    <>
      <Row input>
        <Label>{label}</Label>
        <Container>
          <IntervalSlider value={displayValue} {...settings} onDrag={onUpdate} />
          <Vector value={displayValue} settings={_settings} onUpdate={onUpdate} innerLabelTrim={0} />
        </Container>
      </Row>
    </>
  )
}
