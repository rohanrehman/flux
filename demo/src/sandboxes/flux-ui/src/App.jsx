import { useEffect, useCallback, useState, useRef } from 'preact/hooks'
import { folder, Flux, useControls, FluxPanel, useCreateStore, button } from 'flux'
import './styles.css'

function useDrag(handler) {
  const state = useRef({ active: false, startX: 0, startY: 0, memo: undefined })
  return useCallback((...args) => ({
    onPointerDown(e) {
      e.currentTarget.setPointerCapture(e.pointerId)
      state.current = { active: true, startX: e.clientX, startY: e.clientY, memo: undefined }
      state.current.memo = handler({ first: true, movement: [0, 0], args, memo: undefined })
    },
    onPointerMove(e) {
      if (!state.current.active) return
      const mx = e.clientX - state.current.startX
      const my = e.clientY - state.current.startY
      state.current.memo = handler({ first: false, movement: [mx, my], args, memo: state.current.memo })
    },
    onPointerUp() { state.current.active = false },
  }), [handler])
}

function useDropzone({ onDrop } = {}) {
  const [isDragAccept, setIsDragAccept] = useState(false)

  const getRootProps = () => ({
    onDragOver: (e) => {
      e.preventDefault()
      setIsDragAccept(true)
    },
    onDragLeave: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setIsDragAccept(false)
    },
    onDrop: (e) => {
      e.preventDefault()
      setIsDragAccept(false)
      const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'))
      if (files.length) onDrop?.(files)
    },
  })

  return { getRootProps, isDragAccept }
}

function Box({ index, selected, setSelect }) {
  const store = useCreateStore()

  const [{ position, size, color, fillColor, fillMode, fillImage, width }, set] = useControls(
    () => ({
      position: {
        value: [window.innerWidth / 2 - 150, window.innerHeight / 2],
        step: 1,
      },
      size: { value: { width: 100, height: 100 }, min: 10, lock: true },
      fillMode: { value: 'color', options: ['image'] },
      fillColor: {
        value: '#cfcfcf',
        label: 'fill',
        render: (get) => get('fillMode') === 'color',
      },
      fillImage: {
        image: undefined,
        label: 'fill',
        render: (get) => get('fillMode') === 'image',
      },
      stroke: folder({ color: '#555555', width: { value: 1, min: 0, max: 10 } }),
    }),
    { store }
  )

  const bind = useDrag(({ first, movement: [x, y], args: controls, memo = { position, size } }) => {
    if (first) setSelect([index, store])
    let _position = [...memo.position]
    let _size = { ...memo.size }

    controls.forEach(([control, mod]) => {
      switch (control) {
        case 'position':
          _position[0] += x
          _position[1] += y
          break
        case 'width':
          _size.width += x * mod
          if (mod === -1) _position[0] += x
          break
        case 'height':
          _size.height += y * mod
          if (mod === -1) _position[1] += y
          break
        default:
      }
    })
    set({ position: _position, size: _size })
    return memo
  })

  useEffect(() => {
    setSelect([index, store])
  }, [index, store, setSelect])

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (!acceptedFiles.length) return
      set({ fillImage: acceptedFiles[0], fillMode: 'image' })
    },
    [set]
  )

  const { getRootProps, isDragAccept } = useDropzone({ onDrop })

  const background = fillMode === 'color' || !fillImage ? fillColor : `center / cover no-repeat url(${fillImage})`

  return (
    <div
      {...getRootProps()}
      tabIndex={index}
      className={`box ${selected ? 'selected' : ''}`}
      style={{
        background,
        width: size.width,
        height: size.height,
        boxShadow: `inset 0 0 0 ${width}px ${color}`,
        transform: `translate(${position[0]}px, ${position[1]}px)`,
      }}>
      <span className="handle top" {...bind(['height', -1])} />
      <span className="handle right" {...bind(['width', 1])} />
      <span className="handle bottom" {...bind(['height', 1])} />
      <span className="handle left" {...bind(['width', -1])} />
      <span className="handle corner top-left" {...bind(['width', -1], ['height', -1])} />
      <span className="handle corner top-right" {...bind(['width', 1], ['height', -1])} />
      <span className="handle corner bottom-left" {...bind(['width', -1], ['height', 1])} />
      <span className="handle corner bottom-right" {...bind(['width', 1], ['height', 1])} />
      <span
        className="handle position"
        {...bind(['position'])}
        style={{ background: isDragAccept ? '#18a0fb66' : 'transparent' }}
      />
    </div>
  )
}

export default function App() {
  const [boxes, setBoxes] = useState([])
  const [[selection, store], setSelection] = useState([-1, null])

  useEffect(() => {
    function deleteSelection(e) {
      if (e.key === 'Backspace' && selection > -1 && e.target.classList.contains('selected')) {
        setBoxes((b) => {
          const _b = [...b]
          _b.splice(selection, 1)
          return _b
        })
        setSelection([-1, null])
      }
    }
    window.addEventListener('keydown', deleteSelection)
    return () => window.removeEventListener('keydown', deleteSelection)
  }, [selection])

  const unSelect = (e) => {
    if (e.target === e.currentTarget) setSelection([-1, null])
  }

  const addBox = () => setBoxes((b) => [...b, Date.now()])

  useControls({ 'New Box': button(addBox) })

  return (
    <div className="wrapper">
      <div className="canvas" onClick={unSelect}>
        {boxes.map((v, i) => (
          <Box key={v} selected={selection === i} index={i} setSelect={setSelection} />
        ))}
      </div>
      <div className="panel">
        <Flux fill flat titleBar={false} />
        <FluxPanel store={store} fill flat titleBar={false} />
      </div>
    </div>
  )
}
