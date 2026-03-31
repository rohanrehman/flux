import type { JSX, Ref } from 'preact'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>

export function ImageContainer({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-image-container ${className}`.trim()} {...props} />
}

export function DropZone({ innerRef, isDragAccept, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement>; isDragAccept?: boolean }) {
  return (
    <div
      ref={innerRef}
      class={`flux-dropzone${isDragAccept ? ' flux-dropzone--accept' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function ImagePreview({ innerRef, hasImage, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement>; hasImage?: boolean }) {
  return (
    <div
      ref={innerRef}
      class={`flux-image-preview${hasImage ? ' flux-image-preview--has-image' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

export function ImageLargePreview({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-image-large-preview ${className}`.trim()} {...props} />
}

export function Instructions({ innerRef, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement> }) {
  return <div ref={innerRef} class={`flux-image-instructions ${className}`.trim()} {...props} />
}

export function Remove({ innerRef, disabled, className = '', ...props }: DivProps & { innerRef?: Ref<HTMLDivElement>; disabled?: boolean }) {
  return (
    <div
      ref={innerRef}
      class={`flux-image-remove${disabled ? ' flux-image-remove--disabled' : ''} ${className}`.trim()}
      {...props}
    />
  )
}
