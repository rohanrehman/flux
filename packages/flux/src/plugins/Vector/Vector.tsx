/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'
import { useInputContext } from '../../context'
import { useInputSetters } from '../../hooks'
import { sanitizeValue } from '../../utils'
import { Number } from '../Number'
import type { CoordinateProps, VectorProps } from './vector-types'

type DivProps = JSX.IntrinsicElements['div']
type SvgProps = JSX.IntrinsicElements['svg']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

function Coordinate<T extends Record<string, number>>({
  value,
  id,
  valueKey,
  settings,
  onUpdate,
  innerLabelTrim,
}: CoordinateProps<T>) {
  // `value` may be a phaze-Signal/Computed (callable getter) or a plain
  // object — Vector2dComponent passes the displayValue signal down, but
  // direct callers (custom UIs, plugin development) may pass a plain
  // object. Read defensively each call.
  const resolveBag = () => (typeof value === 'function' ? (value as () => T)() : value)
  const readNum = () => resolveBag()[valueKey]

  // Phaze migration: useRef → plain mutable local. Components run once,
  // so closure over `value[valueKey]` would freeze; readNum() picks up
  // the fresh value at each setValue invocation (fired from event
  // handlers, not the render path).
  let currentValue = readNum()

  const setValue = (newValue: any) => {
    currentValue = readNum()
    // sanitizeValue's path/store args are only used for SELECT options
    // — number inputs ignore them. Casting to silence the strict overload.
    onUpdate({
      [valueKey]: (sanitizeValue as any)({ type: 'NUMBER', value: currentValue, settings }, newValue),
    } as any)
  }

  const number = useInputSetters({
    type: 'NUMBER',
    value: currentValue,
    settings,
    setValue,
    valueGetter: readNum,
  })

  return (
    <Number
      id={id}
      label={valueKey as string}
      value={readNum()}
      displayValue={number.displayValue() as any}
      onUpdate={number.onUpdate}
      onChange={number.onChange}
      settings={settings}
      innerLabelTrim={innerLabelTrim}
    />
  )
}

type ContainerProps = DivProps & { withLock?: boolean; ref?: RefLike<HTMLDivElement> }

export function Container({ withLock, ref, className = '', ...props }: ContainerProps) {
  return (
    <div
      ref={ref as any}
      class={[
        'flux-vector-container',
        withLock ? 'flux-vector-container--with-lock' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}

// TODO increase click area

function Lock({ locked, ...props }: SvgProps & { locked: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {locked ? (
        <path
          d="M5 4.63601C5 3.76031 5.24219 3.1054 5.64323 2.67357C6.03934 2.24705 6.64582 1.9783 7.5014 1.9783C8.35745 1.9783 8.96306 2.24652 9.35823 2.67208C9.75838 3.10299 10 3.75708 10 4.63325V5.99999H5V4.63601ZM4 5.99999V4.63601C4 3.58148 4.29339 2.65754 4.91049 1.99307C5.53252 1.32329 6.42675 0.978302 7.5014 0.978302C8.57583 0.978302 9.46952 1.32233 10.091 1.99162C10.7076 2.65557 11 3.57896 11 4.63325V5.99999H12C12.5523 5.99999 13 6.44771 13 6.99999V13C13 13.5523 12.5523 14 12 14H3C2.44772 14 2 13.5523 2 13V6.99999C2 6.44771 2.44772 5.99999 3 5.99999H4ZM3 6.99999H12V13H3V6.99999Z"
          fill="currentColor"
          fill-rule="evenodd"
          clip-rule="evenodd"
        />
      ) : (
        <path
          d="M9 3.63601C9 2.76044 9.24207 2.11211 9.64154 1.68623C10.0366 1.26502 10.6432 1 11.5014 1C12.4485 1 13.0839 1.30552 13.4722 1.80636C13.8031 2.23312 14 2.84313 14 3.63325H15C15 2.68242 14.7626 1.83856 14.2625 1.19361C13.6389 0.38943 12.6743 0 11.5014 0C10.4294 0 9.53523 0.337871 8.91218 1.0021C8.29351 1.66167 8 2.58135 8 3.63601V6H1C0.447715 6 0 6.44772 0 7V13C0 13.5523 0.447715 14 1 14H10C10.5523 14 11 13.5523 11 13V7C11 6.44772 10.5523 6 10 6H9V3.63601ZM1 7H10V13H1V7Z"
          fill="currentColor"
          fill-rule="evenodd"
          clip-rule="evenodd"
        />
      )}
    </svg>
  )
}

export function Vector<T extends Record<string, number>>({
  value,
  onUpdate,
  settings,
  innerLabelTrim,
}: VectorProps<T>) {
  const { id, setSettings } = useInputContext()

  // TODO atm if lock is explicitly set in settings we show the lock, this can probably be improved with better logic.
  const { lock, locked } = settings

  // Prefer settings.keys (canonical: ['x','y'] / ['x','y','z']) — works
  // for both array-format and object-format vector inputs. Fallback to
  // Object.keys on the resolved value bag for non-vector consumers like
  // the Interval plugin which routes through Vector but has no `.keys`
  // on its settings ({ min: NumberSettings, max: NumberSettings }).
  const keys = ((settings as any).keys as string[] | undefined) ?? (() => {
    const v = typeof value === 'function' ? (value as () => any)() : value
    return v ? Object.keys(v) : []
  })()

  return (
    <Container withLock={lock}>
      {lock && <Lock locked={locked!} onClick={() => setSettings({ locked: !locked })} />}
      {keys.map((key, i) => (
        <Coordinate
          id={i === 0 ? id : `${id}.${key}`}
          key={key}
          valueKey={key}
          value={value}
          settings={(settings as any)[key]}
          onUpdate={onUpdate}
          innerLabelTrim={innerLabelTrim}
        />
      ))}
    </Container>
  )
}
