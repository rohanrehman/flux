import { useControls, useStoreContext, useCreateStore, FluxPanel, FluxStoreProvider } from 'flux'

function MyComponent() {
  const store = useStoreContext()
  useControls({ point: [0, 0] }, { store })
  return null
}

export default function App() {
  const store1 = useCreateStore()
  const store2 = useCreateStore()
  useControls({ color: '#fff' }, { store: store1 })
  useControls({ boolean: true }, { store: store2 })
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
      <FluxStoreProvider store={store1}>
        <MyComponent />
      </FluxStoreProvider>
    </div>
  )
}
