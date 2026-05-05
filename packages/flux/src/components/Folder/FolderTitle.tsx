/** @jsxImportSource @madenowhere/phaze */
import { StyledTitle } from './StyledFolder'
import { Chevron } from '../UI'

export type FolderTitleProps = {
  name?: string
  // Reactive form so Chevron's rotation tracks open/close. Phaze
  // components run once — passing a plain boolean would freeze the
  // chevron at the initial state. Callers pass the Signal/Computed
  // directly.
  toggled: boolean | (() => boolean)
  toggle: (flag?: boolean) => void
}

export function FolderTitle({ toggle, toggled, name }: FolderTitleProps) {
  return (
    <StyledTitle onClick={() => toggle()}>
      <Chevron toggled={toggled} />
      <div>{name}</div>
    </StyledTitle>
  )
}
