import { useInputContext } from '../context'
import { useRawDrag, type DragState, type DragConfig } from './useRawDrag'

export function useDrag(handler: (state: DragState) => any, config?: DragConfig) {
  const { emitOnEditStart, emitOnEditEnd } = useInputContext()
  return useRawDrag((state) => {
    if (state.first) {
      document.body.classList.add('flux__panel__dragged')
      emitOnEditStart?.()
    }
    const result = handler(state)
    if (state.last) {
      document.body.classList.remove('flux__panel__dragged')
      emitOnEditEnd?.()
    }
    return result
  }, config)
}
