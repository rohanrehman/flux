# gluon

A GUI controls panel for Preact apps, built on CSS variables and compatible with your project's Tailwind setup.

## Install

```bash
npm install @rohanrehman/gluon
```

## Usage

**With Tailwind:**
```tsx
import { useControls } from '@rohanrehman/gluon'
import '@rohanrehman/gluon/dist/gluon.core.css'
```

**Without Tailwind:**
```tsx
import { useControls } from '@rohanrehman/gluon'
import '@rohanrehman/gluon/dist/gluon.css'

function App() {
  const { speed, color } = useControls({
    speed: 1,
    color: '#ff0000',
  })
}
```

## License

MIT
