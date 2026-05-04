import { useControls, createStore, FluxPanel } from 'flux'

// FluxStoreProvider is gone in the phaze migration — phaze has no
// createContext primitive. Pass the store explicitly to each useControls
// call instead; this matches the outcome of the preact-era provider
// without the wrapper component.
export default function App() {
  const store1 = createStore()
  const store2 = createStore()
  useControls({ color: '#fff' }, { store: store1 })
  useControls({ boolean: true }, { store: store2 })
  useControls({ point: [0, 0] }, { store: store1 })

  return (
    <div
      style={{
        display: 'grid',
        width: 300,
        gridRowGap: 10,
        padding: 10,
        background: '#fff',
      }}>
      <FluxPanel store={store1} fill flat titleBar={false} />
      <FluxPanel store={store2} fill flat titleBar={false} />
    </div>
  )
}
