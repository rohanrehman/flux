/** @jsxImportSource @madenowhere/phaze */
import { effect, cleanup } from '@madenowhere/phaze'
import { RgbaColorPicker, RgbColorPicker } from './ColorPicker'
import { colord } from 'colord'
import { PickerWrapper, ColorPreview, PickerContainer } from './StyledColor'
import { ValueInput } from '../../components/ValueInput'
import { Label, Row, Overlay, Portal } from '../../components/UI'
import { useInputContext } from '../../context'
import { usePopin } from '../../hooks'
import type { ColorProps, Color as ColorType } from './color-types'

function convertToRgb(value: ColorType, _format: string) {
  return colord(value).toRgb()
}

export function Color({
  value,
  displayValue,
  settings,
  onUpdate,
}: Pick<ColorProps, 'value' | 'displayValue' | 'settings' | 'onChange' | 'onUpdate'>) {
  const { emitOnEditStart, emitOnEditEnd } = useInputContext()

  const { format, hasAlpha } = settings

  const { popinRef, wrapperRef, shown, show, hide } = usePopin()

  // Pending close timer — plain mutable local (Pattern 5).
  let timer = 0

  const ColorPicker = hasAlpha ? RgbaColorPicker : RgbColorPicker

  const showPicker = () => {
    show()
    emitOnEditStart()
  }

  const hidePicker = () => {
    hide()
    emitOnEditEnd()
    window.clearTimeout(timer)
  }

  const hideAfterDelay = () => {
    timer = window.setTimeout(hidePicker, 500)
  }

  effect(() => {
    cleanup(() => window.clearTimeout(timer))
  })

  return (
    <>
      <ColorPreview innerRef={popinRef} active={() => shown()} onClick={() => showPicker()} style={{ color: displayValue as string }} />
      {() =>
        shown() && (
          <Portal>
            <Overlay onPointerUp={hidePicker} />
            <PickerWrapper
              innerRef={wrapperRef}
              onMouseEnter={() => window.clearTimeout(timer)}
              onMouseLeave={(e: MouseEvent) => (e as MouseEvent & { buttons: number }).buttons === 0 && hideAfterDelay()}>
              <ColorPicker color={convertToRgb(value, format)} onChange={onUpdate} />
            </PickerWrapper>
          </Portal>
        )
      }
    </>
  )
}

export function ColorComponent() {
  const { value, displayValue, label, onChange, onUpdate, settings } = useInputContext<ColorProps>()

  return (
    <Row input>
      <Label>{label}</Label>
      <PickerContainer>
        <Color value={value} displayValue={displayValue} onChange={onChange} onUpdate={onUpdate} settings={settings} />
        <ValueInput value={displayValue as string} onChange={onChange} onUpdate={onUpdate} />
      </PickerContainer>
    </Row>
  )
}
