/** @jsxImportSource @madenowhere/phaze */
import { signal, effect } from '@madenowhere/phaze'
import { useStoreContext } from '../../context'
import { useToggle } from '../../hooks'
import { useTh } from '../../styles'
import type { Tree } from '../../types'
import { join } from '../../utils'
import { Control } from '../Control'
import { isInput } from '../Flux/tree'
import { FolderTitle } from './FolderTitle'
import { StyledContent, StyledFolder, StyledWrapper } from './StyledFolder'

type FolderProps = { name: string; path?: string; tree: Tree }

const Folder = ({ name, path, tree }: FolderProps) => {
  const store = useStoreContext()
  const newPath = join(path, name)
  const { collapsed, color } = store.getFolderSettings(newPath)
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

  return (
    <StyledFolder innerRef={folderRef}>
      <FolderTitle
        name={name!}
        toggled={toggled()}
        toggle={() => toggled.set(!toggled())}
      />
      <TreeWrapper parent={newPath} tree={tree} toggled={toggled} />
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
}

export function TreeWrapper({
  isRoot = false,
  fill = false,
  flat = false,
  parent,
  tree,
  toggled,
}: TreeWrapperProps) {
  const { wrapperRef, contentRef } = useToggle(toggled)
  const store = useStoreContext()

  const getOrder = ([key, o]: [key: string, o: any]) => {
    const order = isInput(o) ? store.getInput(o.path)?.order : store.getFolderSettings(join(parent, key)).order
    return order || 0
  }

  const entries = Object.entries(tree).sort((a, b) => getOrder(a) - getOrder(b))
  return (
    <StyledWrapper innerRef={wrapperRef} isRoot={isRoot} fill={fill} flat={flat}>
      <StyledContent innerRef={contentRef} isRoot={isRoot} toggled={toggled()}>
        {entries.map(([key, value]) =>
          isInput(value) ? (
            // @ts-expect-error
            <Control key={value.path} valueKey={value.valueKey} path={value.path} />
          ) : (
            <Folder key={key} name={key} path={parent} tree={value as Tree} />
          )
        )}
      </StyledContent>
    </StyledWrapper>
  )
}
