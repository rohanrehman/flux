import { useControls, Flux } from 'flux'

// Phaze migration: useControls returns a Computed<T> instead of a plain
// object — read it via data() inside JSX/effects to subscribe.
// (lucide-preact dropped: preact-only, not phaze-compatible.)
export default function App() {
  const data = useControls({
    number: 10,
    minmax: { value: 12.5, min: 5.5, max: 30.5, optional: true },
    printSize: { value: 100, min: 80, max: 140, step: 10 },
    color: {
      value: '#f00',
      hint: 'Hey, we support icons and hinting values and long text will wrap!',
      label: '◐',
    },
  })

  return (
    <>
      <Flux titleBar={false} />
      <pre>{() => JSON.stringify(data(), null, '  ')}</pre>
    </>
  )
}
