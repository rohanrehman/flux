import { useControls } from 'flux'
import { bezier } from '@flux-ui/plugin-bezier'
import './style.css'

export default function App() {
  const data = useControls({ curve: bezier() })

  return (
    <div className="App">
      <div
        className="bezier-animated"
        style={() => ({ animationTimingFunction: data().curve.cssEasing })}
      />
      <pre>{() => JSON.stringify(data().curve, null, '  ')}</pre>
    </div>
  )
}
