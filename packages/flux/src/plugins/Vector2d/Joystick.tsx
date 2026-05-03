/** @jsxImportSource @madenowhere/phaze */
import { signal, effect, cleanup } from '@madenowhere/phaze'
import { useDrag } from '../../hooks'
import { clamp, multiplyStep } from '../../utils'
import { JoystickTrigger, JoystickPlayground } from './StyledJoystick'
import { useTh } from '../../styles'
import { Portal } from '../../components/UI'
import { useTransform } from '../../hooks'
import type { Vector2d } from '../../types'
import type { Vector2dProps } from './vector2d-types'

type JoystickProps = { value: Vector2d } & Pick<Vector2dProps, 'onUpdate' | 'settings'>

export function Joystick({ value, settings, onUpdate }: JoystickProps) {
  // Mutable state — phaze components run once so plain locals persist
  // for the row's lifetime (Pattern 5).
  let timeout: number | undefined
  let outOfBoundsX = 0
  let outOfBoundsY = 0
  let stepMultiplier = 1

  const joystickShown = signal(false)
  const isOutOfBounds = signal(false)

  const [spanRef, set] = useTransform<HTMLSpanElement>()

  const joystickRef = signal<HTMLDivElement>()
  const playgroundRef = signal<HTMLDivElement>()

  // Position the floating playground centered on the trigger when shown.
  effect(() => {
    if (!joystickShown()) return
    const j = joystickRef()
    const p = playgroundRef()
    if (!j || !p) return
    const { top, left, width, height } = j.getBoundingClientRect()
    p.style.left = left + width / 2 + 'px'
    p.style.top = top + height / 2 + 'px'
  })

  const {
    keys: [v1, v2],
    joystick,
  } = settings
  const yFactor = joystick === 'invertY' ? 1 : -1
  // prettier-ignore
  const {[v1]: { step: stepV1 }, [v2]: { step: stepV2 }} = settings

  const wpx = useTh('sizes', 'joystickWidth')
  const hpx = useTh('sizes', 'joystickHeight')

  const w = (parseFloat(wpx) * 0.8) / 2
  const h = (parseFloat(hpx) * 0.8) / 2

  const startOutOfBounds = () => {
    if (timeout) return
    isOutOfBounds.set(true)
    if (outOfBoundsX) set({ x: outOfBoundsX * w })
    if (outOfBoundsY) set({ y: outOfBoundsY * -h })
    timeout = window.setInterval(() => {
      onUpdate((v: Vector2d) => {
        const incX = stepV1 * outOfBoundsX * stepMultiplier
        const incY = yFactor * stepV2 * outOfBoundsY * stepMultiplier
        return Array.isArray(v)
          ? {
              [v1]: v[0] + incX,
              [v2]: v[1] + incY,
            }
          : {
              [v1]: v[v1] + incX,
              [v2]: v[v2] + incY,
            }
      })
    }, 16)
  }

  const endOutOfBounds = () => {
    if (timeout !== undefined) {
      window.clearTimeout(timeout)
      timeout = undefined
    }
    isOutOfBounds.set(false)
  }

  // Track step modifier keys for the lifetime of the row.
  effect(() => {
    function setStepMultiplier(event: KeyboardEvent) {
      stepMultiplier = multiplyStep(event)
    }
    window.addEventListener('keydown', setStepMultiplier)
    window.addEventListener('keyup', setStepMultiplier)
    cleanup(() => {
      if (timeout !== undefined) window.clearTimeout(timeout)
      window.removeEventListener('keydown', setStepMultiplier)
      window.removeEventListener('keyup', setStepMultiplier)
    })
  })

  const bind = useDrag(({ first, active, delta: [dx, dy], movement: [mx, my] }) => {
    if (first) joystickShown.set(true)

    const _x = clamp(mx, -w, w)
    const _y = clamp(my, -h, h)

    outOfBoundsX = Math.abs(mx) > Math.abs(_x) ? Math.sign(mx - _x) : 0
    outOfBoundsY = Math.abs(my) > Math.abs(_y) ? Math.sign(_y - my) : 0

    // @ts-expect-error
    let newX = value[v1]
    // @ts-expect-error
    let newY = value[v2]

    if (active) {
      if (!outOfBoundsX) {
        newX += dx * stepV1 * stepMultiplier
        set({ x: _x })
      }
      if (!outOfBoundsY) {
        newY -= yFactor * dy * stepV2 * stepMultiplier
        set({ y: _y })
      }
      if (outOfBoundsX || outOfBoundsY) startOutOfBounds()
      else endOutOfBounds()

      onUpdate({ [v1]: newX, [v2]: newY })
    } else {
      joystickShown.set(false)
      outOfBoundsX = 0
      outOfBoundsY = 0
      set({ x: 0, y: 0 })
      endOutOfBounds()
    }
  })

  return (
    <JoystickTrigger innerRef={joystickRef} {...bind()}>
      {() =>
        joystickShown() && (
          <Portal>
            <JoystickPlayground innerRef={playgroundRef} isOutOfBounds={isOutOfBounds()}>
              <div />
              <span ref={spanRef as any} />
            </JoystickPlayground>
          </Portal>
        )
      }
    </JoystickTrigger>
  )
}
