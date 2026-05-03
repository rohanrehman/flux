/** @jsxImportSource @madenowhere/phaze */
import { signal, computed, effect, cleanup } from '@madenowhere/phaze'
import { Components, useInputContext } from '@rohanrehman/flux/plugin'

// The component is named `Date` (matches the plugin's public API) which
// shadows the global `Date` constructor inside this module. Alias it
// here so all `new D(...)` calls resolve to the JS built-in.
const D = globalThis.Date
type D = globalThis.Date
import {
  InputContainer,
  StyledInput,
  StyledWrapper,
  CalendarHeader,
  CalendarGrid,
  NavButton,
  DayButton,
  DayName,
} from './StyledDate'
import type { DateProps } from './date-types'

const { Label, Row, Portal, Overlay } = Components

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function sameDay(a: D, b: D): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function startOfMonth(d: D): D {
  return new D(d.getFullYear(), d.getMonth(), 1)
}

/**
 * Build the 6×7 day grid for the month containing `cursor`. Includes
 * trailing days from the previous month and leading days from the next
 * month so the grid is always rectangular.
 */
function buildMonthGrid(cursor: D): { date: D; outside: boolean }[] {
  const first = startOfMonth(cursor)
  const startWeekday = first.getDay() // 0=Sunday
  const cells: { date: D; outside: boolean }[] = []

  // Lead with previous-month tail.
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new D(first)
    d.setDate(d.getDate() - i - 1)
    cells.push({ date: d, outside: true })
  }

  // The current month.
  const monthDays = new D(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  for (let i = 1; i <= monthDays; i++) {
    cells.push({ date: new D(first.getFullYear(), first.getMonth(), i), outside: false })
  }

  // Trail with next-month head until we hit a 6-row grid (42 cells).
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date
    const d = new D(last)
    d.setDate(d.getDate() + 1)
    cells.push({ date: d, outside: true })
  }

  return cells
}

export function Date() {
  const { label, value, onUpdate, settings } = useInputContext<DateProps>()

  const isOpen = signal(false)
  // Cursor: which month we're currently viewing in the grid.
  const cursor = signal(startOfMonth(value.date))

  const grid = computed(() => buildMonthGrid(cursor()))

  const monthLabel = computed(() => {
    const c = cursor()
    return `${MONTH_NAMES[c.getMonth()]} ${c.getFullYear()}`
  })

  const prevMonth = () => {
    const c = cursor()
    cursor.set(new D(c.getFullYear(), c.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    const c = cursor()
    cursor.set(new D(c.getFullYear(), c.getMonth() + 1, 1))
  }

  const select = (d: D) => {
    onUpdate(d)
    isOpen.set(false)
  }

  // Esc closes the picker.
  effect(() => {
    if (!isOpen()) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') isOpen.set(false)
    }
    window.addEventListener('keydown', onKey)
    cleanup(() => window.removeEventListener('keydown', onKey))
  })

  return (
    <Row input>
      <Label>{label}</Label>
      <InputContainer>
        <StyledInput
          value={() => value.date.toLocaleDateString(settings.locale)}
          onClick={() => isOpen.set(!isOpen())}
        />
        {() =>
          isOpen() && (
            <Portal>
              <Overlay onPointerUp={() => isOpen.set(false)} style={{ zIndex: 9999 }} />
              <StyledWrapper style={{ zIndex: 10000 }}>
                <CalendarHeader>
                  <NavButton onClick={prevMonth} aria-label="Previous month">
                    ‹
                  </NavButton>
                  <span>{() => monthLabel()}</span>
                  <NavButton onClick={nextMonth} aria-label="Next month">
                    ›
                  </NavButton>
                </CalendarHeader>
                <CalendarGrid>
                  {DAY_NAMES.map((n) => (
                    <DayName key={n}>{n}</DayName>
                  ))}
                  {() =>
                    grid().map((cell) => (
                      <DayButton
                        key={`${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`}
                        outside={cell.outside}
                        selected={() => sameDay(cell.date, value.date)}
                        onClick={() => select(cell.date)}>
                        {cell.date.getDate()}
                      </DayButton>
                    ))
                  }
                </CalendarGrid>
              </StyledWrapper>
            </Portal>
          )
        }
      </InputContainer>
    </Row>
  )
}
