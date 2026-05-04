import type { InputWithSettings, FluxInputProps, NumberSettings } from '../../types'

export type InternalNumberSettings = {
  min: number
  max: number
  step: number
  pad: number
  initialValue: number
  suffix?: string
}
export type NumberInput = InputWithSettings<number | string, NumberSettings>

export type NumberProps = FluxInputProps<number, InternalNumberSettings>

// `value` may be a plain number (back-compat) or a thunk — phaze
// callers pass a thunk so the scrubber tracks store updates during
// drag. RangeSlider unwraps via typeof check.
export type RangeSliderProps = { value: number | (() => number); onDrag: (v: number) => void } & InternalNumberSettings
