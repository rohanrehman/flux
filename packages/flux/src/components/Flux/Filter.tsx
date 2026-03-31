import { useMemo, useState, useEffect, useRef, useCallback } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import { useDrag } from '../../hooks'
import { debounce } from '../../utils'
import { FolderTitleProps } from '../Folder'
import { Chevron } from '../UI'
import { StyledTitleWithFilter, TitleContainer, Icon, FilterWrapper } from './StyledFilter'

type FilterControlProps = { setFilter: (value: string) => void; toggle: (flag?: boolean) => void }
type FilterInputProps = FilterControlProps & { filterShown: boolean }

function FilterInput({ setFilter, toggle, filterShown }: FilterInputProps) {
  const [value, set] = useState('')
  const inputNode = useRef<HTMLInputElement | null>(null)
  const inputRef = useCallback((el: HTMLInputElement | null) => {
    if (el === null || el instanceof HTMLInputElement) {
      inputNode.current = el
    }
  }, [])
  const debouncedOnChange = useMemo<FilterControlProps['setFilter']>(() => debounce(setFilter, 250), [setFilter])
  const clear = () => {
    setFilter('')
    set('')
  }

  const _onChange = (e: Event) => {
    const v = (e.currentTarget as HTMLInputElement).value
    toggle(true)
    set(v)
  }

  useEffect(() => {
    debouncedOnChange(value)
  }, [value, debouncedOnChange])

  useEffect(() => {
    if (filterShown) inputNode.current?.focus()
    else inputNode.current?.blur()
  }, [filterShown])

  return (
    <>
      <input
        ref={inputRef}
        id="flux-filter-input"
        name="flux-filter-input"
        class="flux-filter-input"
        value={value}
        placeholder="[Open filter with CMD+SHIFT+L]"
        onPointerDown={(e) => e.stopPropagation()}
        onChange={_onChange}
      />
      <Icon onClick={() => clear()} style={{ visibility: value ? 'visible' : 'hidden' }}>
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
  FolderTitleProps & {
    onDrag: (point: { x?: number; y?: number }) => void
    onDragStart: (point: { x?: number; y?: number }) => void
    onDragEnd: (point: { x?: number; y?: number }) => void
    title: ComponentChildren
    drag: boolean
    filterEnabled: boolean
    from?: { x?: number; y?: number }
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
  const [filterShown, setShowFilter] = useState(false)

  const bind = useDrag(
    ({ offset: [x, y], first, last }) => {
      onDrag({ x, y })

      if (first) {
        onDragStart({ x, y })
      }

      if (last) {
        onDragEnd({ x, y })
      }
    },
    {
      filterTaps: true,
      from: ({ offset: [x, y] }) => [from?.x || x, from?.y || y],
    }
  )

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === 'L' && event.shiftKey && event.metaKey) {
        setShowFilter((f: boolean) => !f)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  return (
    <>
      <StyledTitleWithFilter mode={drag ? 'drag' : undefined}>
        <Icon active={!toggled} onClick={() => toggle()}>
          <Chevron toggled={toggled} width={12} height={8} />
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
          <Icon active={filterShown} onClick={() => setShowFilter((f: boolean) => !f)}>
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
      <FilterWrapper toggled={filterShown}>
        <FilterInput filterShown={filterShown} setFilter={setFilter} toggle={toggle} />
      </FilterWrapper>
    </>
  )
}
