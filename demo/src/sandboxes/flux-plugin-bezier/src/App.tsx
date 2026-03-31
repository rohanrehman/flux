import { useControls } from 'flux'
import { bezier } from '@flux-ui/plugin-bezier'
import './style.css'

export default function App() {
  const { curve } = useControls({ curve: bezier() })

  return (
    <div className="App">
      <div className="bezier-animated" style={{ animationTimingFunction: curve.cssEasing }} />
      <pre>{JSON.stringify(curve, null, '  ')}</pre>
    </div>
  )
}
