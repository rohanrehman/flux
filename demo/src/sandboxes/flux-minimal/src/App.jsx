import { useControls, Flux } from 'flux'
import { Contrast } from 'lucide-preact'

export default function App() {
  const data = useControls({
    number: 10,
    minmax: { value: 12.5, min: 5.5, max: 30.5, optional: true },
    printSize: { value: 100, min: 80, max: 140, step: 10 },
    color: {
      value: '#f00',
      hint: 'Hey, we support icons and hinting values and long text will wrap!',
      label: <Contrast size={12} />,
    },
  })

  return (
    <>
      <Flux titleBar={false} />
      <pre>{JSON.stringify(data, null, '  ')}</pre>
    </>
  )
}
