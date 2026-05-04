import { signal, computed } from '@madenowhere/phaze'

// Hash-based router: bind a phaze signal to location.hash. Avoids the
// preact-iso/Suspense dependency and makes the route reactive everywhere
// the signal is read.
const initialRoute = () => globalThis.location?.hash?.replace(/^#/, '') || '/'
const route = signal(initialRoute())

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => route.set(initialRoute()))
  window.addEventListener('popstate', () => route.set(initialRoute()))
}

function navigate(path) {
  if (location.hash !== `#${path}`) location.hash = path
}

// Static-import sandboxes for now. Tradeoff: bigger initial bundle but
// no lazy-loading wrapper that has to play games with phaze's
// "function-as-JSX-child gets called" semantics. We'll revisit lazy
// loading once Stage 3 is otherwise solid.
import FluxMinimal from './sandboxes/flux-minimal/src/App'

const sandboxes = {
  'flux-minimal': FluxMinimal,
  // Other sandboxes will be added back once they've been migrated.
}

function Home() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '10vh 20px' }}>
      <h1 style={{ fontWeight: 600, marginBottom: 32 }}>Flux demos</h1>
      <nav style={{ display: 'grid', gap: 10 }}>
        {Object.keys(sandboxes).map((name) => (
          <a
            key={name}
            href={`#/${name}`}
            style={{ color: 'inherit' }}
            onClick={(e) => {
              e.preventDefault()
              navigate(`/${name}`)
            }}>
            {name}
          </a>
        ))}
      </nav>
    </main>
  )
}

function BackLink() {
  return (
    <a
      href="#/"
      onClick={(e) => {
        e.preventDefault()
        navigate('/')
      }}
      style={{
        position: 'fixed',
        left: 10,
        bottom: 10,
        zIndex: 9999,
        padding: '8px 12px',
        background: '#000',
        color: '#fff',
        fontWeight: 500,
        fontSize: 14,
        textDecoration: 'none',
        borderRadius: 2,
        border: '1px solid #333',
      }}>
      ← Back
    </a>
  )
}

function SandboxView({ name }) {
  const Component = sandboxes[name]
  return (
    <>
      <BackLink />
      <Component />
    </>
  )
}

const currentSandboxName = computed(() => {
  const r = route()
  if (r === '/' || r === '') return null
  const name = r.replace(/^\//, '')
  return name in sandboxes ? name : null
})

export default function App() {
  return (
    <>
      {() => {
        const r = route()
        if (r === '/' || r === '') return <Home />
        const name = currentSandboxName()
        return name ? <SandboxView name={name} /> : <p style={{ padding: 20 }}>Not found</p>
      }}
    </>
  )
}
