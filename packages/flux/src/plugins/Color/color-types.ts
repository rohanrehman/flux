import type { ColorVectorInput, InputWithSettings, FluxInputProps } from '../../types'

export type Format = 'hex' | 'rgb' | 'hsl' | 'hsv'

export type Color = string | ColorVectorInput
export type InternalColorSettings = { format: Format; hasAlpha: boolean; isString: boolean }

export type ColorInput = InputWithSettings<Color>

export type ColorProps = FluxInputProps<Color, InternalColorSettings, string>
