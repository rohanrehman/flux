/** @jsxImportSource @madenowhere/phaze */
import { signal, effect, cleanup, computed } from '@madenowhere/phaze'
import type { JSXChild } from '@madenowhere/phaze'
import { buildTree } from './tree'
import { TreeWrapper } from '../Folder'

import { useTransform } from '../../hooks'

import { StyledRoot } from './StyledRoot'
import { mergeTheme, FluxCustomTheme } from '../../styles'
import { setActiveTheme, setActiveStore, setActivePanelSettings } from '../../context'
import { TitleWithFilter } from './Filter'
import { StoreType } from '../../types'

type CSSProps = Record<string, string | number | undefined>

export type FluxRootProps = {
  /**
   * Custom theme overriding default CSS variable values
   */
  theme?: FluxCustomTheme
  /**
   * The store to be used by the panel
   */
  store?: StoreType | null
  /**
   * If true, won't display the panel
   */
  hidden?: boolean
  /**
   * If true, will preset the panel even if no paths are defined
   */
  neverHide?: boolean
  /**
   * If true, the panel will fill its parent
   */
  fill?: boolean
  /**
   * If true, the panel will have no border radius nor shadow
   */
  flat?: boolean
  /**
   * If true, the panel will start collapsed.
   * If set to an object, the collapsed state is controlled via the property.
   */
  collapsed?:
    | boolean
    | {
        collapsed: boolean
        onChange: (collapsed: boolean) => void
      }
  /**
   * If true, input labels will stand above the controls
   */
  oneLineLabels?: boolean
  /**
   * If true, the title bar including filters and drag zone will be shown. If set to false, the title bar including filters will be hidden.
   * In case it is set to an object the title bar will be shown and the additional sub-options might be applied.
   */
  titleBar?:
    | boolean
    | {
        title?: JSXChild
        drag?: boolean
        filter?: boolean
        position?: { x?: number; y?: number }
        onDrag?: (position: { x?: number; y?: number }) => void
        onDragStart?: (position: { x?: number; y?: number }) => void
        onDragEnd?: (position: { x?: number; y?: number }) => void
      }
  /**
   * If true, the copy button will be hidden
   */
  hideCopyButton?: boolean
  /**
   * If true, enables glass/frosted mode. Can also be set via theme.glass.enabled = 'true'
   */
  glass?: boolean
}

export function FluxRoot({ store, hidden = false, theme, collapsed = false, glass, ...props }: FluxRootProps) {
  // Theme is a one-time merge — phaze components run once, so the theme
  // computed at mount stays stable for the panel's lifetime. To switch
  // themes the user re-mounts <Flux>, same as preact-era behavior.
  const themeContext = mergeTheme(theme ?? undefined)
  const glassEnabled = glass ?? (themeContext.theme.glass?.enabled === 'true')

  // Set the global theme signal so all consumers (StyledRoot, useTh, etc.)
  // can read it. cleanup() clears it on unmount so a parent that unmounts
  // <Flux> doesn't leak a stale theme into the next mount.
  effect(() => {
    setActiveTheme(themeContext as any)
    cleanup(() => setActiveTheme(null))
  })

  // Collapsible state. Internal mode: signal we own. Controlled mode:
  // mirror the prop into a computed so reads track changes from outside.
  const internalToggle = signal(!collapsed)
  const computedToggled = computed(() =>
    typeof collapsed === 'object' ? !collapsed.collapsed : internalToggle()
  )
  const computedSetToggle = (value: boolean | ((prev: boolean) => boolean)) => {
    if (typeof collapsed === 'object') {
      if (typeof value === 'function') {
        collapsed.onChange(!value(!collapsed.collapsed))
      } else {
        collapsed.onChange(!value)
      }
    } else {
      const v = typeof value === 'function' ? value(internalToggle()) : value
      internalToggle.set(v)
    }
  }

  if (!store || hidden) return null

  return (
    <FluxCore
      store={store}
      {...props}
      glass={glassEnabled}
      toggled={computedToggled}
      setToggle={computedSetToggle}
      rootStyle={themeContext.style as any}
    />
  )
}

type FluxCoreProps = Omit<FluxRootProps, 'theme' | 'hidden' | 'collapsed'> & {
  store: StoreType
  rootStyle: CSSProps
  toggled: () => boolean
  glass: boolean
  setToggle: (value: boolean | ((prev: boolean) => boolean)) => void
}

function FluxCore({
  store,
  rootStyle,
  fill = false,
  flat = false,
  glass = false,
  neverHide = false,
  oneLineLabels = false,
  titleBar = {
    title: undefined,
    drag: true,
    filter: true,
    position: undefined,
    onDrag: undefined,
    onDragStart: undefined,
    onDragEnd: undefined,
  },
  hideCopyButton = false,
  toggled,
  setToggle,
}: FluxCoreProps) {
  // Set active store and panel settings via module-level signals (Pattern
  // 6). Cleanup resets to the global default on unmount so re-mounts get a
  // fresh state.
  effect(() => {
    setActiveStore(store)
    setActivePanelSettings({ hideCopyButton })
  })

  const paths = store.visiblePaths
  const filter = signal('')
  const tree = computed(() => buildTree(paths(), filter()))

  // Drag transform — useTransform returns [refSignal, setFn].
  const [rootRef, set] = useTransform<HTMLDivElement>()

  const title = typeof titleBar === 'object' ? titleBar.title || undefined : undefined
  const drag = typeof titleBar === 'object' ? titleBar.drag ?? true : true
  const filterEnabled = typeof titleBar === 'object' ? titleBar.filter ?? true : true
  const position = typeof titleBar === 'object' ? titleBar.position || undefined : undefined
  const onDrag = typeof titleBar === 'object' ? titleBar.onDrag || undefined : undefined
  const onDragStart = typeof titleBar === 'object' ? titleBar.onDragStart || undefined : undefined
  const onDragEnd = typeof titleBar === 'object' ? titleBar.onDragEnd || undefined : undefined

  // Apply position whenever the controlled prop changes.
  effect(() => {
    set({ x: position?.x, y: position?.y })
  })

  // shouldShow tracks paths reactively.
  const shouldShow = computed(() => neverHide || paths().length > 0)

  return (
    <StyledRoot
      innerRef={rootRef}
      fill={fill}
      flat={flat}
      glass={glass}
      oneLineLabels={oneLineLabels}
      hideTitleBar={!titleBar}
      style={() => ({ ...rootStyle, display: shouldShow() ? 'block' : 'none' })}>
      {titleBar && (
        <TitleWithFilter
          onDrag={(point) => {
            set(point)
            onDrag?.(point)
          }}
          onDragStart={(point) => onDragStart?.(point)}
          onDragEnd={(point) => onDragEnd?.(point)}
          setFilter={(v: string) => filter.set(v)}
          toggle={(flag?: boolean) => setToggle((t: boolean) => flag ?? !t)}
          toggled={toggled}
          title={title}
          drag={drag}
          filterEnabled={filterEnabled}
          from={position}
        />
      )}
      {() => {
        // Outer thunk only depends on shouldShow (path count crossing 0).
        // The inner TreeWrapper receives `tree` as a thunk so its <For>
        // reconciles paths incrementally as useControls calls add/remove
        // them — no full panel rebuild on tree shape change.
        if (!shouldShow()) return null
        return (
          <TreeWrapper
            isRoot
            fill={fill}
            flat={flat}
            tree={tree}
            toggled={toggled}
            store={store}
          />
        )
      }}
    </StyledRoot>
  )
}
