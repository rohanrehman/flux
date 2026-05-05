/** @jsxImportSource @madenowhere/phaze */
import { useStoreContext } from '../..'
import { ButtonInput, type StoreType } from '../../types'
import { Row } from '../UI'
import { StyledButton } from './StyledButton'

type ButtonProps = {
  label: string
  store?: StoreType
} & Omit<ButtonInput, 'type'>

export function Button({ onClick, settings, label, store: storeProp }: ButtonProps) {
  // Prefer the threaded store (from Control). Fall back to module-global
  // for direct callers outside the panel render tree.
  const store = storeProp ?? useStoreContext()
  return (
    <Row>
      <StyledButton disabled={settings.disabled} onClick={() => onClick(store.get)}>
        {label}
      </StyledButton>
    </Row>
  )
}
