import { useMemo, useState, useEffect } from 'preact/hooks'
import type { JSX, ComponentChildren } from 'preact'
import { memo } from '../../utils/memo'
import { buildTree } from './tree'
import { TreeWrapper } from '../Folder'

import { useDeepMemo, useTransform, useVisiblePaths } from '../../hooks'

import { StyledRoot } from './StyledRoot'
import { mergeTheme, FluxCustomTheme } from '../../styles'
import { ThemeContext, StoreContext, PanelSettingsContext } from '../../context'
import { TitleWithFilter } from './Filter'
import { StoreType } from '../../types'

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
        /**
         * Overwrites the default title content (6 dots if drag is enabled) if set to a non undefined value.
         */
        title?: ComponentChildren
        /**
         * Toggle whether the flux panel can be dragged around via the title bar.
         */
        drag?: boolean
        /**
         * Toggle whether filtering should be enabled or disabled.
         */
        filter?: boolean
        /**
         * The position(x and y coordinates) of the flux panel.
         */
        position?: { x?: number; y?: number }
        /**
         * The callback is called when the flux panel is dragged.
         */
        onDrag?: (position: { x?: number; y?: number }) => void
        /**
         * The callback is called when the flux panel starts to be dragged.
         */
        onDragStart?: (position: { x?: number; y?: number }) => void
        /**
         * The callback is called when the flux panel stops being dragged.
         */
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
  const themeContext = useDeepMemo(() => mergeTheme(theme ?? undefined), [theme])
  const glassEnabled = glass ?? (themeContext.theme.glass?.enabled === 'true')
  // collapsible
  const [toggled, setToggle] = useState(!collapsed)

  const computedToggled = typeof collapsed === 'object' ? !collapsed.collapsed : toggled
  const computedSetToggle = useMemo(() => {
    if (typeof collapsed === 'object') {
      return (value: boolean | ((prev: boolean) => boolean)) => {
        if (typeof value === 'function') {
          collapsed.onChange(!value(!collapsed.collapsed))
        } else {
          collapsed.onChange(!value)
        }
      }
    }
    return setToggle
  }, [collapsed])

  if (!store || hidden) return null

  return (
    <ThemeContext.Provider value={themeContext}>
      <FluxCore
        store={store}
        {...props}
        glass={glassEnabled}
        toggled={computedToggled}
        setToggle={computedSetToggle}
        rootStyle={themeContext.style}
      />
    </ThemeContext.Provider>
  )
}

type FluxCoreProps = Omit<FluxRootProps, 'theme' | 'hidden' | 'collapsed'> & {
  store: StoreType
  rootStyle: JSX.CSSProperties
  toggled: boolean
  glass: boolean
  setToggle: (value: boolean | ((prev: boolean) => boolean)) => void
}

const FluxCore = memo(
  ({
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
  }: FluxCoreProps) => {
    const paths = useVisiblePaths(store)
    const [filter, setFilter] = useState('')
    const tree = useMemo(() => buildTree(paths, filter), [paths, filter])

    // drag
    const [rootRef, set] = useTransform<HTMLDivElement>()

    // this generally happens on first render because the store is initialized in useEffect.
    const shouldShow = neverHide || paths.length > 0
    const title = typeof titleBar === 'object' ? titleBar.title || undefined : undefined
    const drag = typeof titleBar === 'object' ? titleBar.drag ?? true : true
    const filterEnabled = typeof titleBar === 'object' ? titleBar.filter ?? true : true
    const position = typeof titleBar === 'object' ? titleBar.position || undefined : undefined
    const onDrag = typeof titleBar === 'object' ? titleBar.onDrag || undefined : undefined
    const onDragStart = typeof titleBar === 'object' ? titleBar.onDragStart || undefined : undefined
    const onDragEnd = typeof titleBar === 'object' ? titleBar.onDragEnd || undefined : undefined

    useEffect(() => {
      set({ x: position?.x, y: position?.y })
    }, [position, set])

    return (
      <PanelSettingsContext.Provider value={{ hideCopyButton }}>
          <StyledRoot
            innerRef={rootRef}
            fill={fill}
            flat={flat}
            glass={glass}
            oneLineLabels={oneLineLabels}
            hideTitleBar={!titleBar}
            style={{ ...rootStyle, display: shouldShow ? 'block' : 'none' }}>
            {titleBar && (
              <TitleWithFilter
                onDrag={(point) => {
                  set(point)
                  onDrag?.(point)
                }}
                onDragStart={(point) => onDragStart?.(point)}
                onDragEnd={(point) => onDragEnd?.(point)}
                setFilter={setFilter}
                toggle={(flag?: boolean) => setToggle((t: boolean) => flag ?? !t)}
                toggled={toggled}
                title={title}
                drag={drag}
                filterEnabled={filterEnabled}
                from={position}
              />
            )}
            {shouldShow && (
              <StoreContext.Provider value={store}>
                <TreeWrapper isRoot fill={fill} flat={flat} tree={tree} toggled={toggled} />
              </StoreContext.Provider>
            )}
          </StyledRoot>
        </PanelSettingsContext.Provider>
    )
  }
)
