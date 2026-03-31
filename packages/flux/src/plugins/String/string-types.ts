import type { InputWithSettings, FluxInputProps } from '../../types'

export type StringSettings = { editable?: boolean; rows?: boolean | number }
export type InternalStringSettings = { editable: boolean; rows: number }
export type StringInput = InputWithSettings<string, StringSettings>
export type StringProps = FluxInputProps<string, InternalStringSettings>
