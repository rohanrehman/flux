/** @jsxImportSource @madenowhere/phaze */
import { signal, effect, For } from '@madenowhere/phaze'
import { useToggle } from '../../hooks'
import { useTh } from '../../styles'
import type { StoreType, Tree } from '../../types'
import { join } from '../../utils'
import { Control } from '../Control'
import { isInput } from '../Flux/tree'
import { FolderTitle } from './FolderTitle'
import { StyledContent, StyledFolder, StyledWrapper } from './StyledFolder'

type FolderProps = { name: string; path?: string; tree: Tree; store: StoreType }

const Folder = ({ name, path, tree, store }: FolderProps) => {
  const newPath = join(path, name)
  const settings = store.getFolderSettings(newPath)
  const { collapsed, color, render } = settings
  const toggled = signal(!collapsed)

  const folderRef = signal<HTMLDivElement>()

  const widgetColor = useTh('colors', 'folderWidgetColor')
  const textColor = useTh('colors', 'folderTextColor')

  // Apply folder color CSS vars when the ref lands. Phaze auto-tracks
  // folderRef() so the effect re-runs once the element mounts.
  effect(() => {
    const el = folderRef()
    if (!el) return
    el.style.setProperty('--flux-colors-folderWidgetColor', color || widgetColor)
    el.style.setProperty('--flux-colors-folderTextColor', color || textColor)
  })

  // Render-fn-driven visibility. Folder is always in the tree (so we
  // don't rebuild the panel when it shows/hides), but its `display` flips
  // reactively based on `render(get)`. Reading `store.get` inside this
  // thunk tracks the underlying input.value signal, so flipping a
  // controlling input toggles the folder instantly without remounting
  // anything else. Folders without a render fn always show.
  const displayStyle = render
    ? () => ({ display: render(store.get) ? '' : 'none' })
    : undefined

  // Lazy-mount the contents on first expand. Collapsed-by-default folders
  // would otherwise mount every input row at panel-init time — with ~30
  // rows across all folders that's a synchronous cost paid up front. After
  // the user opens a folder once, its contents stay mounted so subsequent
  // collapse/expand cycles are pure CSS height transitions (animated by
  // useToggle inside TreeWrapper).
  const everExpanded = signal<boolean>(toggled())
  effect(() => { if (toggled()) everExpanded.set(true) })

  return (
    <StyledFolder innerRef={folderRef} style={displayStyle as any}>
      <FolderTitle
        name={name!}
        toggled={toggled}
        toggle={() => toggled.set(!toggled())}
      />
      {() => everExpanded()
        ? <TreeWrapper parent={newPath} tree={tree} toggled={toggled} store={store} />
        : <span style={{ display: 'none' }} />
      }
    </StyledFolder>
  )
}

type TreeWrapperProps = {
  isRoot?: boolean
  fill?: boolean
  flat?: boolean
  parent?: string
  // `tree` may be a static Tree (the captured slice for nested folders)
  // OR a thunk (the root TreeWrapper, where the tree shape changes as
  // useControls calls add/remove paths). The thunk form lets <For> below
  // pick up additions/removals incrementally — only new entries mount,
  // only gone entries unmount, the rest stay in place.
  tree: Tree | (() => Tree)
  // Phaze migration: toggled is a thunk so useToggle can subscribe.
  // FluxRoot passes a Computed; nested Folders pass a Signal.
  toggled: () => boolean
  // Threaded explicitly from FluxCore. Module-global useStoreContext is
  // unsafe across multiple mounted panels — the last-mounted FluxPanel
  // sets currentStore, and any later re-render of the first panel's
  // subtree picks up the wrong store. Pass-down breaks that race.
  store: StoreType
}

type Entry = [string, unknown]

export function TreeWrapper({
  isRoot = false,
  fill = false,
  flat = false,
  parent,
  tree,
  toggled,
  store,
}: TreeWrapperProps) {
  const { wrapperRef, contentRef } = useToggle(toggled)
  const treeFn = typeof tree === 'function' ? tree : () => tree

  const getOrder = ([key, o]: Entry): number => {
    const order = isInput(o as object)
      ? store.getInput((o as { path: string }).path)?.order
      : store.getFolderSettings(join(parent, key)).order
    return order || 0
  }

  // Sorted entries — recomputed when the tree shape changes (only the
  // root TreeWrapper passes a reactive tree; nested folders' tree is
  // a static slice and the function returns the same array each call).
  const entries = (): Entry[] =>
    Object.entries(treeFn()).sort((a, b) => getOrder(a) - getOrder(b))

  // Per-entry key for <For>'s LIS reconciler. Inputs key by their full
  // path (stable across schema reorders); folders key by name within
  // their parent (stable as long as the user doesn't rename the folder).
  const getEntryKey = ([key, value]: Entry): string =>
    isInput(value as object)
      ? (value as { path: string }).path
      : `folder:${key}`

  return (
    <StyledWrapper innerRef={wrapperRef} isRoot={isRoot} fill={fill} flat={flat}>
      <StyledContent innerRef={contentRef} isRoot={isRoot} toggled={toggled}>
        <For each={entries} getKey={getEntryKey}>
          {([key, value]) => (
            isInput(value as object)
              // @ts-expect-error — Control's prop typing widens through For
              ? <Control valueKey={(value as any).valueKey} path={(value as any).path} store={store} />
              : <Folder name={key} path={parent} tree={value as Tree} store={store} />
          )}
        </For>
      </StyledContent>
    </StyledWrapper>
  )
}
