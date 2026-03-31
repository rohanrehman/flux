import { getKeyPath } from '../../utils'
import type { Tree } from '../../types'

export const isInput = (v: object): v is { __fluxInput: true; path: string } => '__fluxInput' in v

function deepSet(obj: any, path: string[], value: any) {
  let current = obj
  for (const key of path) {
    if (!current[key]) current[key] = {}
    current = current[key]
  }
  Object.assign(current, value)
}

export const buildTree = (paths: string[], filter?: string): Tree => {
  const tree = {}
  const _filter = filter ? filter.toLowerCase() : null
  paths.forEach((path) => {
    const [valueKey, folderPath] = getKeyPath(path)
    if (!_filter || valueKey.toLowerCase().indexOf(_filter) > -1) {
      deepSet(tree, folderPath ? folderPath.split('.') : [], { [valueKey]: { __fluxInput: true, path } })
    }
  })
  return tree
}
