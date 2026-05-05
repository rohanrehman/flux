import { useControls, monitor, Flux } from 'flux'
import { plot } from '@flux-ui/plugin-plot'

export default function App() {
  const startTime = performance.now()
  const values = useControls({
    w: 1,
    y1: plot({ expression: 'cos(x*w)', boundsX: [-10, 10] }),
    y2: plot({ expression: 'x * y1', boundsX: [-100, 100] }),
    y3: plot({ expression: 'tan(y2)', boundsX: [-4, 4], boundsY: [-10, 10] }),
  })

  useControls({
    'y1(t)': monitor(
      () => {
        const t = performance.now() - startTime
        return values().y1(t / 100)
      },
      { graph: true, interval: 30 }
    ),
  })

  return (
    <div className="App">
      <Flux titleBar={false} />
      <pre>{() => `y1(1) = ${values().y1(1)}`}</pre>
      <pre>{() => `y2(1) = ${values().y2(1)}`}</pre>
      <pre>{() => `y3(1) = ${values().y3(1)}`}</pre>
    </div>
  )
}
