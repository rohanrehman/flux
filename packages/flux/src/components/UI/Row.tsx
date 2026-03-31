import { StyledRow, StyledInputRow } from './StyledUI'
import type { JSX } from 'preact'

type RowProps = JSX.HTMLAttributes<HTMLDivElement> & { disabled?: boolean; input?: boolean }

export function Row({ input, ...props }: RowProps) {
  if (input) return <StyledInputRow {...props} />
  return <StyledRow {...props} />
}
