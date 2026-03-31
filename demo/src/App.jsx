import { lazy, Suspense } from 'preact/compat'
import { Router } from 'preact-iso'

const sandboxes = {
  'flux-minimal': lazy(() => import('./sandboxes/flux-minimal/src/App')),
  'flux-headless': lazy(() => import('./sandboxes/flux-headless/src/App')),
  'flux-busy': lazy(() => import('./sandboxes/flux-busy/src/App')),
  'flux-advanced-panels': lazy(() => import('./sandboxes/flux-advanced-panels/src/App')),
  'flux-scroll': lazy(() => import('./sandboxes/flux-scroll/src/App')),
  'flux-ui': lazy(() => import('./sandboxes/flux-ui/src/App')),
  'flux-theme': lazy(() => import('./sandboxes/flux-theme/src/App')),
  'flux-plugin-spring': lazy(() => import('./sandboxes/flux-plugin-spring/src/App')),
  'flux-plugin-plot': lazy(() => import('./sandboxes/flux-plugin-plot/src/App')),
  'flux-plugin-bezier': lazy(() => import('./sandboxes/flux-plugin-bezier/src/App')),
  'flux-plugin-dates': lazy(() => import('./sandboxes/flux-plugin-dates/src/App')),
  'flux-custom-plugin': lazy(() => import('./sandboxes/flux-custom-plugin/src/App')),
}

function Home() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '10vh 20px' }}>
      <h1 style={{ fontWeight: 600, marginBottom: 32 }}>Flux demos</h1>
      <nav style={{ display: 'grid', gap: 10 }}>
        {Object.keys(sandboxes).map((name) => (
          <a key={name} href={`/${name}`} style={{ color: 'inherit' }}>
            {name}
          </a>
        ))}
      </nav>
    </main>
  )
}

function SandboxPage({ name }) {
  const Component = sandboxes[name]
  if (!Component) return <p style={{ padding: 20 }}>Not found</p>
  return (
    <>
      <a
        href="/"
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
      <Suspense fallback={null}>
        <Component />
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <Router>
      <Home path="/" />
      <SandboxPage path="/:name" />
    </Router>
  )
}
