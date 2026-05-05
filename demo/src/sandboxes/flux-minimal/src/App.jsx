import { useControls, Flux } from 'flux'

// lucide-preact is preact-only; inline the Contrast icon SVG at the same
// 12×12 size the preact-era demo used (<Contrast size={12} />). Wrapped
// in a function: phaze JSX returns a real DOM Node that can only live in
// one place, so module-top-level JSX would attach once and stay there.
// As a thunk, phaze creates fresh DOM on each insertion (matches how
// preact VNodes worked).
const ContrastIcon = () => (
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
    <circle cx="12" cy="12" r="10" />
    <path d="M12 18a6 6 0 0 0 0-12v12z" />
  </svg>
)

export default function App() {
  const data = useControls({
    number: 10,
    minmax: { value: 12.5, min: 5.5, max: 30.5, optional: true },
    printSize: { value: 100, min: 80, max: 140, step: 10 },
    color: {
      value: '#f00',
      hint: 'Hey, we support icons and hinting values and long text will wrap!',
      label: ContrastIcon,
    },
  })

  return (
    <>
      <Flux titleBar={false} />
      <pre>{() => JSON.stringify(data(), null, '  ')}</pre>
    </>
  )
}
