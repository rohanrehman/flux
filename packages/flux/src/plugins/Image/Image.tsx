import { useCallback } from 'preact/hooks'
import { Label, Portal, Overlay, Row } from '../../components/UI'
import { useDropzone } from './useDropzone'
import { DropZone, ImageContainer, ImagePreview, Instructions, ImageLargePreview, Remove } from './StyledImage'
import { useInputContext } from '../../context'
import { usePopin } from '../../hooks'
import type { ImageProps } from './image-types'

export function ImageComponent() {
  const { label, value, onUpdate, disabled, id } = useInputContext<ImageProps>()
  const { popinRef, wrapperRef, shown, show, hide } = usePopin()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length) onUpdate(acceptedFiles[0])
    },
    [onUpdate]
  )

  const clear = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      onUpdate(undefined)
    },
    [onUpdate]
  )

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    maxFiles: 1,
    accept: { 'image/*': [] },
    onDrop,
    disabled,
  })

  // TODO fix any in DropZone
  return (
    <Row input>
      <Label>{label}</Label>
      <ImageContainer>
        <ImagePreview
          innerRef={popinRef}
          hasImage={!!value}
          onPointerDown={() => !!value && show()}
          onPointerUp={hide}
          style={{ backgroundImage: value ? `url(${value})` : 'none' }}
        />
        {shown && !!value && (
          <Portal>
            <Overlay onPointerUp={hide} style={{ cursor: 'pointer' }} />
            <ImageLargePreview innerRef={wrapperRef} style={{ backgroundImage: `url(${value})` }} />
          </Portal>
        )}
        <DropZone {...(getRootProps({ isDragAccept }) as any)}>
          <input {...(getInputProps() as any)} id={id} />
          <Instructions>{isDragAccept ? 'drop image' : 'click or drop'}</Instructions>
        </DropZone>
        <Remove onClick={clear} disabled={!value} />
      </ImageContainer>
    </Row>
  )
}
