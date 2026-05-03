// used as entrypoint

// export all components
import { Row, Label, Portal, Overlay } from '../components/UI'
import { String } from '../plugins/String'
import { Number } from '../plugins/Number'
import { RangeSlider } from '../plugins/Number/RangeSlider'
import { Boolean } from '../plugins/Boolean'
import { Select } from '../plugins/Select'
import { Vector } from '../plugins/Vector'
import { InnerLabel } from '../components/ValueInput/StyledInput'

// No explicit `Record<string, Component>` annotation — phaze's Component
// type returns JSXChild (wider than JSX.Element=Node) which doesn't
// satisfy TS's JSX-element constraint. Letting TS infer the concrete
// component types preserves their JSX usability for plugin consumers.
export const Components = {
  Row,
  Label,
  Portal,
  Overlay,
  String,
  Number,
  Boolean,
  Select,
  Vector,
  InnerLabel,
  RangeSlider,
}

export { colord } from 'colord'
export { dequal } from 'dequal/lite'

export { debounce, clamp, pad, evaluate, range, invertedRange, mergeRefs } from '../utils'
export { normalizeKeyedNumberSettings } from '../plugins/Vector/vector-utils'

export { createPlugin } from '../plugin'

// export vector utilities
export * from '../plugins/Vector/vector-plugin'
// export useful hooks
export { useDrag, usePointerMove, useCanvas2d, useTransform, useInput, useValue, useValues, useInputSetters } from '../hooks'
export type { DragState, DragConfig } from '../hooks/useRawDrag'
export type { MoveState } from '../hooks/usePointerMove'
export { useInputContext, useStoreContext } from '../context'

// export styling utilities
export { useTh } from '../styles'

// export types
export * from '../types/public'
export type { Data, DataInput, DataItem, State, StoreType } from '../types/internal'
export type { InternalVectorSettings } from '../plugins/Vector/vector-types'
export type { InternalNumberSettings } from '../plugins/Number/number-types'
