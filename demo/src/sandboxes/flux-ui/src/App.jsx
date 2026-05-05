/** @jsxImportSource @madenowhere/phaze */
import { signal, effect, cleanup } from '@madenowhere/phaze'
import { folder, Flux, useControls, FluxPanel, createStore, button } from 'flux'
import './styles.css'

// Drag handler — phaze components run once, so the state object is just a
// plain local. The returned `bind` is reused for every handle on the box.
function makeDrag(handler) {
  const state = { active: false, startX: 0, startY: 0, memo: undefined }
  return (...args) => ({
    onPointerDown(e) {
      e.currentTarget.setPointerCapture(e.pointerId)
      state.active = true
      state.startX = e.clientX
      state.startY = e.clientY
      state.memo = handler({ first: true, movement: [0, 0], args, memo: undefined })
    },
    onPointerMove(e) {
      if (!state.active) return
      const mx = e.clientX - state.startX
      const my = e.clientY - state.startY
      state.memo = handler({ first: false, movement: [mx, my], args, memo: state.memo })
    },
    onPointerUp() {
      state.active = false
    },
  })
}

function makeDropzone({ onDrop } = {}) {
  const isDragAccept = signal(false)

  const getRootProps = () => ({
    onDragOver: (e) => {
      e.preventDefault()
      isDragAccept.set(true)
    },
    onDragLeave: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) isDragAccept.set(false)
    },
    onDrop: (e) => {
      e.preventDefault()
      isDragAccept.set(false)
      const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'))
      if (files.length) onDrop?.(files)
    },
  })

  return { getRootProps, isDragAccept }
}

function Box({ index, selected, setSelect }) {
  const store = createStore()

  const box = useControls(
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
  const set = (next) => box.set(next)

  const bind = makeDrag(({ first, movement: [x, y], args: controls, memo }) => {
    const current = box()
    if (!memo) memo = { position: current.position, size: current.size }
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

  effect(() => {
    setSelect([index, store])
  })

  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles.length) return
    set({ fillImage: acceptedFiles[0], fillMode: 'image' })
  }

  const { getRootProps, isDragAccept } = makeDropzone({ onDrop })

  return (
    <div
      {...getRootProps()}
      tabIndex={index}
      className={() => `box ${selected() ? 'selected' : ''}`}
      style={() => {
        const b = box()
        const background =
          b.fillMode === 'color' || !b.fillImage
            ? b.fillColor
            : `center / cover no-repeat url(${b.fillImage})`
        return {
          background,
          width: b.size.width,
          height: b.size.height,
          boxShadow: `inset 0 0 0 ${b.width ?? 0}px ${b.color ?? '#000'}`,
          transform: `translate(${b.position[0]}px, ${b.position[1]}px)`,
        }
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
        style={() => ({ background: isDragAccept() ? '#18a0fb66' : 'transparent' })}
      />
    </div>
  )
}

export default function App() {
  const boxes = signal([])
  const selection = signal([-1, null])

  effect(() => {
    function deleteSelection(e) {
      const [sel] = selection()
      if (e.key === 'Backspace' && sel > -1 && e.target.classList.contains('selected')) {
        const _b = [...boxes()]
        _b.splice(sel, 1)
        boxes.set(_b)
        selection.set([-1, null])
      }
    }
    window.addEventListener('keydown', deleteSelection)
    cleanup(() => window.removeEventListener('keydown', deleteSelection))
  })

  const unSelect = (e) => {
    if (e.target === e.currentTarget) selection.set([-1, null])
  }

  const addBox = () => boxes.set([...boxes(), Date.now()])

  useControls({ 'New Box': button(addBox) })

  return (
    <div className="wrapper">
      <div className="canvas" onClick={unSelect}>
        {() =>
          boxes().map((v, i) => (
            <Box
              key={v}
              selected={() => selection()[0] === i}
              index={i}
              setSelect={(s) => selection.set(s)}
            />
          ))
        }
      </div>
      <div className="panel">
        <Flux fill flat titleBar={false} />
        {() => {
          const store = selection()[1]
          return store && <FluxPanel store={store} fill flat titleBar={false} />
        }}
      </div>
    </div>
  )
}
