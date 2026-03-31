## Gluon Spring

### Installation

```bash
npm i @gluon-ui/plugin-spring
```

### Quick start

```jsx
import { useControls } from 'gluon'
import { spring } from '@gluon-ui/plugin-spring'

function MyComponent() {
  const { mySpring } = useControls({ mySpring: spring({ tension: 100, friction: 30, mass: 1 }) })
  return mySpring.toString()
}
```
