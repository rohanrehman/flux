/** @jsxImportSource @madenowhere/phaze */
import { StyledRow, StyledInputRow } from './StyledUI'

type DivProps = JSX.IntrinsicElements['div']
type RowProps = DivProps & { disabled?: boolean; input?: boolean }

export function Row({ input, ...props }: RowProps) {
  if (input) return <StyledInputRow {...props} />
  return <StyledRow {...props} />
}
