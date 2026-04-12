import { getStep, clamp } from '../../utils'
import type { InternalNumberSettings, NumberInput } from './number-types'

export const schema = (v: any) => {
  if (typeof v === 'number') return true
  // we consider a string as a number if it starts with a number and it's suffix is less than 4 characters
  if (typeof v === 'string') {
    const _v = parseFloat(v)
    if (isNaN(_v)) return false
    const suffix = v.substring(('' + _v).length).trim()
    return suffix.length < 4
  }
  return false
}

export const sanitize = (v: any, { min = -Infinity, max = Infinity, suffix }: InternalNumberSettings) => {
  const _v = parseFloat(v as string)
  if (v === '' || isNaN(_v)) throw Error('Invalid number')
  const f = clamp(_v, min, max)
  return suffix ? f + suffix : f
}

export const format = (v: any, { pad = 0, suffix }: InternalNumberSettings) => {
  const f = parseFloat(v).toFixed(pad)
  return suffix ? f + suffix : f
}

function countDecimals(n: number): number {
  const s = String(n)
  if (s.includes('e-')) return parseInt(s.split('e-')[1])
  const dot = s.indexOf('.')
  return dot === -1 ? 0 : s.length - dot - 1
}

export const normalize = ({ value, ...settings }: NumberInput) => {
  const { min = -Infinity, max = Infinity, ..._settings } = settings

  let _value = parseFloat(value as string)
  const suffix = typeof value === 'string' ? value.substring(('' + _value).length) : undefined
  _value = clamp(_value, min, max)

  let step = settings.step
  if (!step) {
    if (Number.isFinite(min))
      if (Number.isFinite(max)) step = +(Math.abs(max! - min!) / 100).toPrecision(1)
      else step = +(Math.abs(_value - min!) / 100).toPrecision(1)
    else if (Number.isFinite(max)) step = +(Math.abs(max! - _value) / 100).toPrecision(1)
  }
  const padStep = step ? getStep(step) * 10 : getStep(_value)
  step = step || padStep / 10
  // derive pad directly from step's decimal places so small steps like 0.0001 → pad 4
  const pad = step ? countDecimals(step) : Math.round(clamp(Math.log10(1 / padStep), 0, 10))

  return {
    value: suffix ? _value + suffix : _value,
    settings: { initialValue: _value, step, pad, min, max, suffix, ..._settings },
  }
}

// TODO fix this function, probably not needed
export const sanitizeStep = (
  v: number,
  { step, initialValue }: Pick<InternalNumberSettings, 'step' | 'initialValue'>
) => {
  const steps = Math.round((v - initialValue) / step)
  const result = initialValue + steps * step!
  const dec = countDecimals(step)
  return parseFloat(result.toFixed(dec))
}
