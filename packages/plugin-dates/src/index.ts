import { createPlugin } from 'flux/plugin'
import { Date } from './Date'
import { sanitize, normalize, format } from './date-plugin'

export const date = createPlugin({
  sanitize,
  format,
  normalize,
  component: Date,
})
