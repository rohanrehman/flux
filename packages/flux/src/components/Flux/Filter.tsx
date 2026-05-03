/** @jsxImportSource @madenowhere/phaze */
import { signal, effect, cleanup } from '@madenowhere/phaze'
import type { JSXChild, Signal } from '@madenowhere/phaze'
import { useDrag } from '../../hooks'
import { debounce } from '../../utils'
import { FolderTitleProps } from '../Folder'
import { Chevron } from '../UI'
import { StyledTitleWithFilter, TitleContainer, Icon, FilterWrapper } from './StyledFilter'

type FilterControlProps = { setFilter: (value: string) => void; toggle: (flag?: boolean) => void }
type FilterInputProps = FilterControlProps & { filterShown: Signal<boolean> }

function FilterInput({ setFilter, toggle, filterShown }: FilterInputProps) {
  const value = signal('')
  const inputNode: Signal<HTMLInputElement | undefined> = signal()

  const debouncedOnChange = debounce(setFilter, 250)
  const clear = () => {
    setFilter('')
    value.set('')
  }

  const _onChange = (e: Event) => {
    const v = (e.currentTarget as HTMLInputElement).value
    toggle(true)
    value.set(v)
  }

  // Push debounced filter changes whenever value() flips.
  effect(() => {
    debouncedOnChange(value())
  })

  // Track focus on filterShown changes.
  effect(() => {
    const node = inputNode()
    if (!node) return
    if (filterShown()) node.focus()
    else node.blur()
  })

  return (
    <>
      <input
        ref={inputNode}
        id="flux-filter-input"
        name="flux-filter-input"
        class="flux-filter-input"
        value={() => value()}
        placeholder="[Open filter with CMD+SHIFT+L]"
        onPointerDown={(e: PointerEvent) => e.stopPropagation()}
        onChange={_onChange}
      />
      <Icon onClick={() => clear()} style={() => ({ visibility: value() ? 'visible' : 'hidden' })}>
        <svg xmlns="http://www.w3.org/2000/svg" height="14" width="14" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </Icon>
    </>
  )
}

export type TitleWithFilterProps = FilterControlProps &
  Omit<FolderTitleProps, 'name' | 'toggled'> & {
    onDrag: (point: { x?: number; y?: number }) => void
    onDragStart: (point: { x?: number; y?: number }) => void
    onDragEnd: (point: { x?: number; y?: number }) => void
    title: JSXChild
    drag: boolean
    filterEnabled: boolean
    from?: { x?: number; y?: number }
    // toggled is reactive — comes from FluxRoot as a thunk
    toggled: () => boolean
  }

export function TitleWithFilter({
  setFilter,
  onDrag,
  onDragStart,
  onDragEnd,
  toggle,
  toggled,
  title,
  drag,
  filterEnabled,
  from,
}: TitleWithFilterProps) {
  const filterShown = signal(false)

  const bind = useDrag(
    ({ offset: [x, y], first, last }) => {
      onDrag({ x, y })
      if (first) onDragStart({ x, y })
      if (last) onDragEnd({ x, y })
    },
    {
      filterTaps: true,
      from: ({ offset: [x, y] }) => [from?.x || x, from?.y || y],
    }
  )

  // Cmd-Shift-L toggles the filter pane.
  effect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === 'L' && event.shiftKey && event.metaKey) {
        filterShown.set(!filterShown())
      }
    }
    window.addEventListener('keydown', handleShortcut)
    cleanup(() => window.removeEventListener('keydown', handleShortcut))
  })

  return (
    <>
      <StyledTitleWithFilter mode={drag ? 'drag' : undefined}>
        <Icon active={() => !toggled()} onClick={() => toggle()}>
          <Chevron toggled={() => toggled()} width={12} height={8} />
        </Icon>
        <TitleContainer {...(drag ? bind() : {})} drag={drag} filterEnabled={filterEnabled}>
          {title === undefined && drag ? (
            <svg width="20" height="10" viewBox="0 0 28 14" xmlns="http://www.w3.org/2000/svg">
              <circle cx="2" cy="2" r="2" />
              <circle cx="14" cy="2" r="2" />
              <circle cx="26" cy="2" r="2" />
              <circle cx="2" cy="12" r="2" />
              <circle cx="14" cy="12" r="2" />
              <circle cx="26" cy="12" r="2" />
            </svg>
          ) : (
            title
          )}
        </TitleContainer>
        {filterEnabled && (
          <Icon active={() => filterShown()} onClick={() => filterShown.set(!filterShown())}>
            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 20 20">
              <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z"
                clipRule="evenodd"
              />
            </svg>
          </Icon>
        )}
      </StyledTitleWithFilter>
      <FilterWrapper toggled={() => filterShown()}>
        <FilterInput filterShown={filterShown} setFilter={setFilter} toggle={toggle} />
      </FilterWrapper>
    </>
  )
}
