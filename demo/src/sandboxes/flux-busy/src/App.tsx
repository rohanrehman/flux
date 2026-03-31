import { useEffect, useState } from 'preact/hooks'
import { useControls, folder, button, monitor, Flux } from 'flux'
// @ts-ignore
import { Noise } from 'noisejs'
import { Ruler } from 'lucide-preact'
import styles from './styles.module.css'

const noise = new Noise(Math.random())

function frame() {
  const t = Date.now()
  return noise.simplex2(t / 1000, t / 100)
}

function useFullscreen(
  ref: { current: Element | null },
  enabled: boolean,
  { onClose }: { onClose?: () => void } = {}
) {
  useEffect(() => {
    if (enabled) {
      ref.current?.requestFullscreen?.()
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.()
    }
  }, [enabled])

  useEffect(() => {
    if (!onClose) return
    const handler = () => {
      if (!document.fullscreenElement) onClose()
    }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [onClose])
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
            label: <Ruler size={12} />,
          },
          pos3dArr: [Math.PI / 2, 20, 4],
        },
        { color: 'red' }
      ),
    },
    { order: -1 }
  )
  return <pre>{JSON.stringify(data, null, '  ')}</pre>
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
  return <pre>{JSON.stringify(data, null, '  ')}</pre>
}

export default function App() {
  const [count, setCount] = useState(0)
  const [show, setShow] = useState(true)

  const [{ showTitleBar, title, drag, filter, fullScreen, oneLineLabels }, set] = useControls(
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

  useFullscreen({ current: document.documentElement }, fullScreen, {
    onClose: () => set({ fullScreen: false }),
  })

  return (
    <>
      <Flux titleBar={showTitleBar && { drag, title, filter }} oneLineLabels={oneLineLabels} />
      <div className={styles.buttons}>
        Reference count: {count}
        <button onClick={() => setCount((c) => Math.max(0, c - 1))}>-</button>
        <button onClick={() => setCount((c) => c + 1)}>+</button>
        <button onClick={() => setShow((s) => !s)}>Toggle Main Controls</button>
      </div>
      {show && <Controls />}
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <ExtraControls key={i} />
        ))}
    </>
  )
}
