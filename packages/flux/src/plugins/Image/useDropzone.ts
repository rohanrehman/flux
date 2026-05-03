import { signal } from '@madenowhere/phaze'
import type { Signal } from '@madenowhere/phaze'

type DropzoneOptions = {
  accept?: Record<string, string[]>
  maxFiles?: number
  disabled?: boolean
  onDrop?: (files: File[]) => void
}

function matchesAccept(file: File, accept: Record<string, string[]>): boolean {
  return Object.keys(accept).some((mime) => {
    if (mime.endsWith('/*')) return file.type.startsWith(mime.slice(0, -1))
    return file.type === mime
  })
}

/**
 * Lightweight drop-target helper. Returns prop spreaders for the root and
 * the hidden file input plus a reactive `isDragAccept` signal.
 *
 * Phaze migration: useState→signal, useRef→signal (DOM), useCallback ceremony
 * collapses to plain closures (Patterns 1, 3, 5).
 */
export function useDropzone({ accept, maxFiles = 1, disabled, onDrop }: DropzoneOptions) {
  const inputRef: Signal<HTMLInputElement | undefined> = signal()
  const isDragAccept = signal(false)

  const handleFiles = (files: FileList | File[]) => {
    if (disabled) return
    let accepted = Array.from(files)
    if (accept) accepted = accepted.filter((f) => matchesAccept(f, accept))
    if (maxFiles > 0) accepted = accepted.slice(0, maxFiles)
    if (accepted.length) onDrop?.(accepted)
  }

  const getRootProps = (extra?: object) => ({
    tabIndex: disabled ? -1 : 0,
    onClick: () => !disabled && inputRef()?.click(),
    onDragEnter: (e: DragEvent) => {
      e.preventDefault()
      if (!disabled) isDragAccept.set(true)
    },
    onDragLeave: (e: DragEvent) => {
      const target = e.currentTarget as Element
      if (!target.contains(e.relatedTarget as Node)) isDragAccept.set(false)
    },
    onDragOver: (e: DragEvent) => e.preventDefault(),
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      isDragAccept.set(false)
      if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files)
    },
    ...extra,
  })

  const getInputProps = () => ({
    ref: inputRef,
    type: 'file' as const,
    accept: accept ? Object.keys(accept).join(',') : undefined,
    multiple: maxFiles !== 1,
    style: { display: 'none' },
    onChange: (e: Event) => {
      const input = e.target as HTMLInputElement
      if (input.files) {
        handleFiles(input.files)
        input.value = ''
      }
    },
  })

  return { getRootProps, getInputProps, isDragAccept }
}
