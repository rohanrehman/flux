/** @jsxImportSource @madenowhere/phaze */
import { signal, effect, cleanup } from '@madenowhere/phaze'
import { useControls, folder, button, monitor, Flux } from 'flux'
// @ts-ignore
import { Noise } from 'noisejs'
import styles from './styles.module.css'

const noise = new Noise(Math.random())

function frame() {
  const t = Date.now()
  return noise.simplex2(t / 1000, t / 100)
}

// Tracks fullscreen state, listening to fullscreenchange and clearing on
// unmount via cleanup(). Phaze components run once, so the effect's
// closure captures `enabled` as a getter, not a value.
function useFullscreen(enabled: () => boolean, { onClose }: { onClose?: () => void } = {}) {
  effect(() => {
    if (enabled()) {
      document.documentElement?.requestFullscreen?.()
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.()
    }
  })

  effect(() => {
    if (!onClose) return
    const handler = () => {
      if (!document.fullscreenElement) onClose()
    }
    document.addEventListener('fullscreenchange', handler)
    cleanup(() => document.removeEventListener('fullscreenchange', handler))
  })
}

const ExtraControls = () => {
  const data = useControls(
    'folder.subfolder',
    {
      'Hello Button': button((get) => console.log('hello', get('folder.subfolder.deep nested.pos2d'))),
      'deep nested': folder(
        {
          pos2d: { value: { x: 3, y: 4 }, lock: true },
          pos2dArr: [100, 200],
          pos3d: {
            value: { x: 0.3, y: 0.1, z: 0.5 },
            label: '⊞',
          },
          pos3dArr: [Math.PI / 2, 20, 4],
        },
        { color: 'red' }
      ),
    },
    { order: -1 }
  )
  return <pre>{() => JSON.stringify(data(), null, '  ')}</pre>
}

function Controls() {
  const data = useControls({
    dimension: '4px',
    string: { value: 'something', optional: true, order: -2 },
    range: { value: 0, min: -10, max: 10, order: -3 },
    image: { image: undefined },
    select: { options: ['x', 'y', ['x', 'y']] },
    interval: { min: -100, max: 100, value: [-10, 10] },
    color: '#ffffff',
    refMonitor: monitor(frame, { graph: true, interval: 30 }),
    number: { value: 1000, min: 3 },
    disabled: {
      value: 'A disabled input',
      disabled: true,
      hint: 'This input is disabled',
    },
    colorObj: { value: { r: 1, g: 2, b: 3 }, render: (get) => get('folder.boolean') },
    folder: folder(
      {
        noJoy: { value: [1, 2], joystick: false },
        boolean: true,
        spring: { tension: 100, friction: 30 },
      },
      { color: 'yellow', order: -1 }
    ),
  })
  return <pre>{() => JSON.stringify(data(), null, '  ')}</pre>
}

export default function App() {
  const count = signal(0)
  const show = signal(true)

  const panel = useControls(
    'Panel',
    () => ({
      showTitleBar: true,
      fullScreen: false,
      drag: { value: true, render: (get) => get('Panel.showTitleBar') },
      title: { value: 'Flux', render: (get) => get('Panel.showTitleBar') },
      filter: { value: true, render: (get) => get('Panel.showTitleBar') },
      oneLineLabels: false,
    }),
    { color: 'royalblue' }
  )
  // useControls returns a Computed when called with schema-only; with a
  // function-schema it returns [Computed, set]. Normalise.
  const [panelData, set] = Array.isArray(panel) ? panel : [panel, () => {}]

  useFullscreen(() => panelData().fullScreen, {
    onClose: () => set({ fullScreen: false }),
  })

  return (
    <>
      {() => {
        const p = panelData()
        return (
          <Flux
            titleBar={p.showTitleBar && { drag: p.drag, title: p.title, filter: p.filter }}
            oneLineLabels={p.oneLineLabels}
          />
        )
      }}
      <div className={styles.buttons}>
        Reference count: {() => count()}
        <button onClick={() => count.set(Math.max(0, count() - 1))}>-</button>
        <button onClick={() => count.set(count() + 1)}>+</button>
        <button onClick={() => show.set(!show())}>Toggle Main Controls</button>
      </div>
      {() => show() && <Controls />}
      {() =>
        Array(count())
          .fill(0)
          .map((_, i) => <ExtraControls key={i} />)
      }
    </>
  )
}
