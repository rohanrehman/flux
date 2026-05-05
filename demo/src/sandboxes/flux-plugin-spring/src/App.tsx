import { useControls, Flux } from 'flux'
import { spring } from '@flux-ui/plugin-spring'

export default function App() {
  const data = useControls({
    mySpring: spring({ tension: 100, friction: 30, hint: 'spring to use with react-spring' }),
  })

  return (
    <div className="App">
      <Flux titleBar={false} />
      <pre>{() => JSON.stringify(data().mySpring, null, '  ')}</pre>
    </div>
  )
}
