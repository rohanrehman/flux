/** @jsxImportSource @madenowhere/phaze */
import { signal, effect, cleanup } from '@madenowhere/phaze'
import { useControls, folder, button, monitor, Flux } from 'flux'
// @ts-ignore
import { Noise } from 'noisejs'
import styles from './styles.module.css'

// lucide-preact is preact-only; inline the Ruler icon at the same 12×12
// size the preact-era demo used (<Ruler size={12} />). Wrapped in a
// function: phaze JSX returns real DOM nodes that can only live in one
// place, so module-top-level JSX would attach once and stay there. As a
// thunk, phaze creates fresh DOM on each insertion.
const RulerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round">
    <path d="M21.3 8.7 8.7 21.3a2.4 2.4 0 0 1-3.4 0l-2.6-2.6a2.4 2.4 0 0 1 0-3.4L15.3 2.7a2.4 2.4 0 0 1 3.4 0l2.6 2.6a2.4 2.4 0 0 1 0 3.4Z" />
    <path d="m7.5 10.5 2 2" />
    <path d="m10.5 7.5 2 2" />
    <path d="m13.5 4.5 2 2" />
    <path d="m4.5 13.5 2 2" />
  </svg>
)

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
            label: RulerIcon,
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
    // Pin color directly under the `folder` folder. Without this, phaze
    // synchronous-body ordering (parent before children) puts the Panel
    // folder ahead of the order-0 Controls entries, pushing color past
    // interval. preact's children-first useEffect ordering would have
    // landed Controls' paths first; explicit order forces parity.
    color: { value: '#ffffff', order: -0.5 },
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

  useFullscreen(() => panel().fullScreen, {
    onClose: () => panel.set({ fullScreen: false }),
  })

  return (
    <>
      {() => {
        const p = panel()
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
