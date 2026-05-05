/** @jsxImportSource @madenowhere/phaze */
import { signal, effect } from '@madenowhere/phaze'
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

  return (
    <StyledFolder innerRef={folderRef} style={displayStyle as any}>
      <FolderTitle
        name={name!}
        toggled={toggled}
        toggle={() => toggled.set(!toggled())}
      />
      <TreeWrapper parent={newPath} tree={tree} toggled={toggled} store={store} />
    </StyledFolder>
  )
}

type TreeWrapperProps = {
  isRoot?: boolean
  fill?: boolean
  flat?: boolean
  parent?: string
  tree: Tree
  // Phaze migration: toggled is a thunk so useToggle can subscribe.
  // FluxRoot passes a Computed; nested Folders pass a Signal.
  toggled: () => boolean
  // Threaded explicitly from FluxCore. Module-global useStoreContext is
  // unsafe across multiple mounted panels — the last-mounted FluxPanel
  // sets currentStore, and any later re-render of the first panel's
  // subtree picks up the wrong store. Pass-down breaks that race.
  store: StoreType
}

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

  const getOrder = ([key, o]: [key: string, o: any]) => {
    const order = isInput(o) ? store.getInput(o.path)?.order : store.getFolderSettings(join(parent, key)).order
    return order || 0
  }

  const entries = Object.entries(tree).sort((a, b) => getOrder(a) - getOrder(b))
  return (
    <StyledWrapper innerRef={wrapperRef} isRoot={isRoot} fill={fill} flat={flat}>
      <StyledContent innerRef={contentRef} isRoot={isRoot} toggled={toggled}>
        {entries.map(([key, value]) =>
          isInput(value) ? (
            // @ts-expect-error
            <Control key={value.path} valueKey={value.valueKey} path={value.path} store={store} />
          ) : (
            <Folder key={key} name={key} path={parent} tree={value as Tree} store={store} />
          )
        )}
      </StyledContent>
    </StyledWrapper>
  )
}
