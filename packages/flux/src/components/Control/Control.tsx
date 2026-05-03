/** @jsxImportSource @madenowhere/phaze */
import { ControlInput } from './ControlInput'
import { log, FluxErrors } from '../../utils/log'
import { Plugins } from '../../plugin'
import { Button } from '../Button'
import { ButtonGroup } from '../ButtonGroup'
import { Monitor } from '../Monitor'
import { useInput } from '../../hooks'
import { SpecialInputs } from '../../types'

type ControlProps = { path: string }

const specialComponents = {
  [SpecialInputs.BUTTON]: Button,
  [SpecialInputs.BUTTON_GROUP]: ButtonGroup,
  [SpecialInputs.MONITOR]: Monitor,
}

export function Control({ path }: ControlProps) {
  const [inputSignal, { set, setSettings, disable, storeId, emitOnEditStart, emitOnEditEnd }] = useInput(path)
  // Snapshot at row mount — type/key/label don't change after the input
  // is registered. Value changes flow through the per-row InputContext
  // slot in ControlInput.
  const input = inputSignal()
  if (!input) return null

  const { type, label, key, ...inputProps } = input

  if (type in SpecialInputs) {
    // @ts-expect-error
    const SpecialInputForType = specialComponents[type]
    return <SpecialInputForType label={label} path={path} {...inputProps} />
  }

  if (!(type in Plugins)) {
    log(FluxErrors.UNSUPPORTED_INPUT, type, path)
    return null
  }

  return (
    // @ts-expect-error
    <ControlInput
      key={storeId + path}
      type={type}
      label={label}
      storeId={storeId}
      path={path}
      valueKey={key}
      setValue={set}
      setSettings={setSettings}
      disable={disable}
      emitOnEditStart={emitOnEditStart}
      emitOnEditEnd={emitOnEditEnd}
      {...inputProps}
    />
  )
}
