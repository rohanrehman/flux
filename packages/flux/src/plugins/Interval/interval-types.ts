import type { FluxInputProps, IntervalInput } from '../../types'
import type { InternalNumberSettings } from '../Number/number-types'

export type Interval = IntervalInput['value']
export type InternalInterval = { min: number; max: number }

export type InternalIntervalSettings = {
  bounds: [number, number]
  min: InternalNumberSettings
  max: InternalNumberSettings
}

export type IntervalProps = FluxInputProps<Interval, InternalIntervalSettings, InternalInterval>

export type IntervalSliderProps = {
  value: InternalInterval
  onDrag: (v: Partial<InternalInterval>) => void
} & InternalIntervalSettings
