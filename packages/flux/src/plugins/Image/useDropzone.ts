import { useRef, useState, useCallback } from 'preact/hooks'
import type { RefObject } from 'preact'

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

export function useDropzone({ accept, maxFiles = 1, disabled, onDrop }: DropzoneOptions) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragAccept, setIsDragAccept] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      if (disabled) return
      let accepted = Array.from(files)
      if (accept) accepted = accepted.filter((f) => matchesAccept(f, accept))
      if (maxFiles > 0) accepted = accepted.slice(0, maxFiles)
      if (accepted.length) onDrop?.(accepted)
    },
    [disabled, accept, maxFiles, onDrop]
  )

  const getRootProps = useCallback(
    (extra?: object) => ({
      tabIndex: disabled ? -1 : 0,
      onClick: () => !disabled && inputRef.current?.click(),
      onDragEnter: (e: DragEvent) => {
        e.preventDefault()
        if (!disabled) setIsDragAccept(true)
      },
      onDragLeave: (e: DragEvent) => {
        const target = e.currentTarget as Element
        if (!target.contains(e.relatedTarget as Node)) setIsDragAccept(false)
      },
      onDragOver: (e: DragEvent) => e.preventDefault(),
      onDrop: (e: DragEvent) => {
        e.preventDefault()
        setIsDragAccept(false)
        if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files)
      },
      ...extra,
    }),
    [disabled, handleFiles]
  )

  const getInputProps = useCallback(
    () => ({
      ref: inputRef as RefObject<HTMLInputElement>,
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
    }),
    [accept, maxFiles, handleFiles]
  )

  return { getRootProps, getInputProps, isDragAccept }
}
