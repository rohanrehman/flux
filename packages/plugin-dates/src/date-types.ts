import type { FluxInputProps } from '@rohanrehman/flux/plugin'

export type DateSettings = { locale: string; inputFormat: string }
export type DateInput = { date: Date } & Partial<DateSettings>

export type InternalDate = { date: Date; formattedDate: string }

export type InternalDateSettings = Required<DateSettings>

export type DateProps = FluxInputProps<InternalDate, InternalDateSettings, string>
