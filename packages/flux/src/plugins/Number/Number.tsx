/** @jsxImportSource @madenowhere/phaze */
import { signal } from '@madenowhere/phaze'
import type { JSXChild } from '@madenowhere/phaze'
import { NumberInput } from '../../components/ValueInput'
import { Label, Row } from '../../components/UI'
import { useDrag } from '../../hooks'
import { RangeGrid } from './StyledNumber'
import { RangeSlider } from './RangeSlider'
import { useInputContext } from '../../context'
import type { NumberProps } from './number-types'
import { multiplyStep } from '../../utils'
import { InnerNumberLabel } from '../../components/ValueInput/StyledInput'

type DraggableLabelProps = {
  label: string
  step: number
  innerLabelTrim: number
  onUpdate: (v: any) => void
}

function DraggableLabel({ label, onUpdate, step, innerLabelTrim }: DraggableLabelProps) {
  const dragging = signal(false)
  const bind = useDrag(({ active, delta: [dx], event, memo = 0 }) => {
    dragging.set(active)
    memo += dx / 2
    if (Math.abs(memo) >= 1) {
      onUpdate((v: any) => parseFloat(v) + Math.floor(memo) * step * multiplyStep(event))
      memo = 0
    }
    return memo
  })

  return (
    <InnerNumberLabel dragging={() => dragging()} title={label.length > 1 ? label : ''} {...bind()}>
      {label.slice(0, innerLabelTrim)}
    </InnerNumberLabel>
  )
}

export function Number({
  label,
  id,
  displayValue,
  onUpdate,
  onChange,
  settings,
  innerLabelTrim = 1,
}: Omit<NumberProps, 'setSettings' | 'emitOnEditStart' | 'emitOnEditEnd'> & {
  id?: string
  label: string
  innerLabelTrim?: number
}) {
  const InnerLabel: JSXChild = innerLabelTrim > 0 && (
    <DraggableLabel label={label} step={settings.step} onUpdate={onUpdate} innerLabelTrim={innerLabelTrim} />
  )
  // displayValue may be a Signal/Computed (callable) or a plain value —
  // wrap as a thunk so the input updates reactively during scrubbing
  // and stringify only at read time. Without this, `String(signal)`
  // would render the function source code into the input.
  const valueThunk = () => {
    const v = typeof displayValue === 'function' ? (displayValue as () => unknown)() : displayValue
    return String(v ?? '')
  }
  return (
    <NumberInput id={id} value={valueThunk as any} onUpdate={onUpdate} onChange={onChange} innerLabel={InnerLabel} />
  )
}

export function NumberComponent() {
  const { key: _key, ...props } = useInputContext<NumberProps>()
  const { label, displayValue, onUpdate, settings, id } = props
  const { min, max } = settings
  const hasRange = max !== Infinity && min !== -Infinity

  // Pass a reactive accessor for the slider position. displayValue is
  // the live Signal/Computed from useInputSetters; reading it inside
  // the thunk lets the scrubber follow the drag in real time.
  const liveValue = () => {
    const v = typeof displayValue === 'function' ? (displayValue as () => unknown)() : displayValue
    return parseFloat(v as any)
  }

  return (
    <Row input>
      <Label>{label}</Label>
      <RangeGrid hasRange={hasRange}>
        {hasRange && <RangeSlider value={liveValue} onDrag={onUpdate} {...settings} />}
        <Number {...props} id={id} label="value" innerLabelTrim={hasRange ? 0 : 1} />
      </RangeGrid>
    </Row>
  )
}
