import type { FluxInputProps } from 'flux/plugin'
import type { JSX } from 'preact'

export type DateSettings = { locale: string; inputFormat: string }
export type DateInput = { date: Date } & Partial<DateSettings>

// TODO: export this upstream
export type DateCalendarContainerProps = JSX.HTMLAttributes<HTMLDivElement> & { children?: any }
export type DateInputProps = {
  value: string
  onClick: JSX.MouseEventHandler<HTMLInputElement>
  onChange: JSX.GenericEventHandler<HTMLInputElement>
}

export type InternalDate = { date: Date; formattedDate: string }

export type InternalDateSettings = Required<DateSettings>

export type DateProps = FluxInputProps<InternalDate, InternalDateSettings, string>
