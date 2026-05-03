import { createPlugin } from '@rohanrehman/flux/plugin'
import { Plot } from './Plot'
import { normalize, sanitize, format } from './plot-plugin'

export const plot = createPlugin({
  normalize,
  sanitize,
  format,
  component: Plot,
})
