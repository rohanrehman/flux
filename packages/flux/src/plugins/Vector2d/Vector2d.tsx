/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'
import { Vector } from '../Vector'
import { Label, Row } from '../../components/UI'
import { Joystick } from './Joystick'
import { useInputContext } from '../../context'
import type { Vector2dProps } from './vector2d-types'

type DivProps = JSX.IntrinsicElements['div']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>
type ContainerProps = DivProps & { withJoystick?: boolean; ref?: RefLike<HTMLDivElement> }

function Container({ withJoystick, ref, className = '', ...props }: ContainerProps) {
  return (
    <div
      ref={ref as any}
      class={[
        'flux-vector2d-container',
        withJoystick ? 'flux-vector2d-container--with-joystick' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}

export function Vector2dComponent() {
  const { label, displayValue, onUpdate, settings } = useInputContext<Vector2dProps>()
  return (
    <Row input>
      <Label>{label}</Label>
      <Container withJoystick={!!settings.joystick}>
        {settings.joystick && <Joystick value={displayValue} settings={settings} onUpdate={onUpdate} />}
        <Vector value={displayValue} settings={settings} onUpdate={onUpdate} />
      </Container>
    </Row>
  )
}
