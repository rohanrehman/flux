/** @jsxImportSource @madenowhere/phaze */
import type { Signal } from '@madenowhere/phaze'

type DivProps = JSX.IntrinsicElements['div']
type RefLike<T> = ((el: T) => void) | { current: T | null } | Signal<T | undefined>

export function ImageContainer({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-image-container ${className}`.trim()} {...props} />
}

export function DropZone({ innerRef, isDragAccept, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement>; isDragAccept?: boolean }) {
  return (
    <div
      ref={innerRef as any}
      class={`flux-dropzone${isDragAccept ? ' flux-dropzone--accept' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function ImagePreview({ innerRef, hasImage, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement>; hasImage?: boolean }) {
  return (
    <div
      ref={innerRef as any}
      class={`flux-image-preview${hasImage ? ' flux-image-preview--has-image' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function ImageLargePreview({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-image-large-preview ${className}`.trim()} {...props} />
}

export function Instructions({ innerRef, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement> }) {
  return <div ref={innerRef as any} class={`flux-image-instructions ${className}`.trim()} {...props} />
}

export function Remove({ innerRef, disabled, className = '', ...props }: DivProps & { innerRef?: RefLike<HTMLDivElement>; disabled?: boolean }) {
  return (
    <div
      ref={innerRef as any}
      class={`flux-image-remove${disabled ? ' flux-image-remove--disabled' : ''} ${className}`.trim()}
      {...props}
    />
  )
}
