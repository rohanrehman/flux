/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Type tests (run them with yarn test:types).
 *
 * `useControls` returns `ControlsHandle<S>` — a callable handle that
 * returns the snapshot when invoked, exposes per-key signal accessors,
 * and has `.set` / `.get` batch methods. Assertions below use
 * `ControlsHandle<>` in place of the preact-era plain-object shape.
 */

import { expectType } from 'tsd'
import { folder } from '../helpers'
import { createPlugin } from '../plugin'
import { useControls, type ControlsHandle } from '../useControls'

/**
 * api
 */
expectType<ControlsHandle<{ a: number }>>(useControls({ a: 3 }))
// b shouldn't be returned by useControls when transient (default)
expectType<ControlsHandle<{ a: number }>>(useControls({ a: 3, b: { value: '#fff', onChange: () => {} } }))
expectType<ControlsHandle<{ a: number }>>(useControls({ a: 3, b: { value: '#fff', onChange: () => {}, transient: true } }))
// @ts-expect-error transient shouldn't be usable alone
expectType<ControlsHandle<{ a: number }>>(useControls({ a: 3, b: { value: '#fff', transient: true } }))
expectType<ControlsHandle<{ a: number; b: string }>>(useControls({ a: 3, b: { value: '#fff', onChange: () => {}, transient: false } }))

// Function schemas now return the same handle (no preact-era tuple).
expectType<ControlsHandle<{ a: number }>>(useControls(() => ({ a: 3 })))
// Function-schema branch with onChange (transient: false ⇒ value still in the values type).
expectType<ControlsHandle<{ a: number; color: string }>>(
  useControls(() => ({ a: 3, color: { value: '#fff', onChange: () => {}, transient: false as const } }))
)

/**
 * options
 */
expectType<ControlsHandle<{ a: number }>>(useControls({ a: { value: 10, render: () => true, label: 'number' } }))
expectType<ControlsHandle<{ a: { x: number; y: number } }>>(
  useControls({ a: { value: { x: 10, y: 10 }, label: 'label', render: (get) => get('something') } })
)

// TODO fix this as this is valid logic
// @ts-expect-error
expectType<ControlsHandle<{ a: { x: number; y: number } }>>(useControls({ a: { x: 10, y: 10, label: 'label' } }))

/**
 * numbers
 */
expectType<ControlsHandle<{ a: number }>>(useControls({ a: 10 }))
expectType<ControlsHandle<{ a: number; b: number }>>(useControls({ a: 10, b: 3 }))
expectType<ControlsHandle<{ a: number }>>(useControls({ a: { value: 10 } }))
expectType<ControlsHandle<{ a: number }>>(useControls({ a: { value: 10, min: 0, max: 10, step: 1 } }))

/**
 * strings
 */
expectType<ControlsHandle<{ a: string }>>(useControls({ a: 'some string' }))

/**
 * selects
 */
expectType<ControlsHandle<{ a: string }>>(useControls({ a: { options: ['foo', 'bar'] } }))
expectType<ControlsHandle<{ a: number | string }>>(useControls({ a: { options: [1, 'bar'] } }))
// SchemaToValues collapses `['foo', 1, ['foo', 'bar']]` to `string | number | string[]`
// (each tuple element widens independently — no cross-element number/string fusion).
expectType<ControlsHandle<{ a: string | number | string[] }>>(useControls({ a: { options: ['foo', 1, ['foo', 'bar']] } }))
expectType<ControlsHandle<{ a: boolean | number }>>(useControls({ a: { options: { foo: 1, bar: true } } }))
expectType<ControlsHandle<{ a: string | number | string[] }>>(useControls({ a: { value: 3, options: ['foo', ['foo', 'bar']] } }))

/**
 * images
 */
expectType<ControlsHandle<{ a: string | undefined }>>(useControls({ a: { image: undefined } }))

/**
 * color objects
 */
expectType<ControlsHandle<{ a: { r: number; g: number; b: number } }>>(useControls({ a: { r: 10, g: 10, b: 10 } }))
expectType<ControlsHandle<{ a: { r: number; g: number; b: number; a: number } }>>(useControls({ a: { r: 10, g: 10, b: 10, a: 1 } }))

/**
 * booleans
 */
expectType<ControlsHandle<{ a: boolean }>>(useControls({ a: true }))
expectType<ControlsHandle<{ a: boolean }>>(useControls({ a: false }))

/**
 * intervals
 */
expectType<ControlsHandle<{ a: [number, number] }>>(useControls({ a: { value: [0, 10], min: 0, max: 20 } }))

/**
 * Vector2d
 */
expectType<ControlsHandle<{ a: { x: number; y: number } }>>(useControls({ a: { x: 10, y: 10 } }))
expectType<ControlsHandle<{ a: { width: number; height: number } }>>(useControls({ a: { width: 10, height: 10 } }))
expectType<ControlsHandle<{ a: { width: number; height: number } }>>(useControls({ a: { value: { width: 10, height: 10 }, min: 0 } }))
expectType<ControlsHandle<{ a: [number, number] }>>(useControls({ a: [0, 0] }))
expectType<ControlsHandle<{ a: [number, number] }>>(useControls({ a: { value: [0, 0] } }))
expectType<ControlsHandle<{ a: [number, number] }>>(useControls({ a: { value: [0, 0], joystick: 'invertY' } }))

/**
 * Vector3d
 */
expectType<ControlsHandle<{ a: { x: number; y: number; z: number } }>>(useControls({ a: { x: 10, y: 10, z: 10 } }))
expectType<ControlsHandle<{ a: { width: number; height: number; depth: number } }>>(
  useControls({ a: { width: 10, height: 10, depth: 1 } })
)
expectType<ControlsHandle<{ a: { width: number; height: number; depth: number } }>>(
  useControls({ a: { value: { width: 10, height: 10, depth: 1 } } })
)
expectType<ControlsHandle<{ a: [number, number, number] }>>(useControls({ a: [0, 0, 0] }))
expectType<ControlsHandle<{ a: [number, number, number] }>>(useControls({ a: { value: [0, 0, 0] } }))

/**
 * folders
 */
expectType<ControlsHandle<{ a1: number; b1: number; b2: string }>>(
  useControls({
    a: folder({
      a1: 1,
      b: folder({ b1: { value: 10 }, b2: 'hello' }),
    }),
  })
)
expectType<
  ControlsHandle<{
    pos2dArr: [number, number]
    pos3dArr: [number, number, number]
  }>
>(
  useControls({
    someFolder: folder({ pos2dArr: [100, 200], innerFolder: folder({ pos3dArr: [0, 0, 0] }) }),
  })
)

/**
 * custom plugins
 */
const nullOrString = createPlugin({
  normalize: (input: string | null) => ({ value: input }),
  component: () => null,
})

const data_nullOrString = useControls({
  null: nullOrString(null),
  string: nullOrString('hello'),
})

expectType<
  ControlsHandle<{
    null: null | string
    string: null | string
  }>
>(data_nullOrString)

const nullOrStringObject = createPlugin({
  normalize: (input: { value: string | null }) => ({ value: input.value }),
  component: () => null,
})

const data_nullOrStringObject = useControls({
  null: nullOrStringObject({ value: null }),
  string: nullOrStringObject({ value: 'hello' }),
})

expectType<
  ControlsHandle<{
    null: null | string
    string: null | string
  }>
>(data_nullOrStringObject)

const arrayNumber = createPlugin({
  normalize: (input: number[]) => ({ value: input }),
  component: () => null,
})

const data_nullOrNumberArray = useControls({
  array: arrayNumber([1, 2, 3]),
})

expectType<ControlsHandle<{ array: number[] }>>(data_nullOrNumberArray)
