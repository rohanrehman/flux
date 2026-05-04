import { useControls, createStore, folder, Flux, FluxPanel, button } from 'flux'
import { spring } from '@flux-ui/plugin-spring'

function Controls() {
  useControls({
    number: { value: 10, step: 0.25 },
    fine: { value: 0.0001, min: 0, max: 0.001, step: 0.0001 },
    image: { image: undefined },
    select: { options: ['x', 'y', ['x', 'y']] },
    interval: { min: -100, max: 100, value: [10, 15] },
    boolean: true,
    folder2: folder(
      {
        color2: 'rgba(255, 255, 255, 1)',
        color: {
          value: 'rgba(255, 0, 91, 1)',
          render: (get) => get('boolean'),
        },
        folder3: folder(
          {
            'Hello Button': button(() => console.log('hello')),
            folder4: folder({
              spring: spring(),
              pos2d: { value: { x: 3, y: 4 } },
              pos2dArr: { value: [100, 200], x: { max: 300 } },
              pos3d: { value: { x: 0.3, k: 0.1, z: 0.5 }, j: { min: 0 } },
              pos3dArr: [Math.PI / 2, 20, 4],
            }),
          },
          { collapsed: false }
        ),
      },
      { render: (get) => get('boolean') }
    ),
    colorObj: { r: 1, g: 2, b: 3, a: 0.5 },
  })

  return null
}

export default function App() {
  const colorsStore = createStore()
  const radiiStore = createStore()
  const spaceStore = createStore()
  const fontSizesStore = createStore()
  const sizesStore = createStore()
  const borderWidthsStore = createStore()
  const fontWeightsStore = createStore()
  const shadowsStore = createStore()
  const glassStore = createStore()

  const colors = useControls(
    {
      colors: folder({
        elevation1: 'rgba(0, 0, 0, 1)',
        elevation2: 'rgba(24, 28, 32, 1)',
        elevation3: 'rgba(55, 60, 75, 1)',
        accent1: 'rgba(0, 102, 220, 1)',
        accent2: 'rgba(0, 123, 255, 1)',
        accent3: 'rgba(60, 147, 255, 1)',
        highlight1: 'rgba(83, 87, 96, 1)',
        highlight2: 'rgba(140, 146, 164, 1)',
        highlight3: 'rgba(254, 254, 254, 1)',
        highlight4: 'rgba(254, 254, 254, 1)',
        vivid1: 'rgba(255, 204, 0, 1)',
      }),
    },
    { store: colorsStore }
  )

  const radii = useControls(
    {
      radii: folder({
        xs: '2px',
        sm: '3px',
        lg: '10px',
      }),
    },
    { store: radiiStore }
  )

  const space = useControls(
    {
      space: folder({
        sm: '6px',
        md: '14px',
        rowGap: '7px',
        colGap: '7px',
      }),
    },
    { store: spaceStore }
  )

  const fontSizes = useControls(
    {
      fontSizes: folder({
        root: '11px',
      }),
    },
    { store: fontSizesStore }
  )

  const sizes = useControls(
    {
      sizes: folder({
        rootWidth: '280px',
        controlWidth: '160px',
        scrubberWidth: '8px',
        scrubberHeight: '16px',
        rowHeight: '24px',
        folderHeight: '20px',
        checkboxSize: '16px',
        joystickWidth: '100px',
        joystickHeight: '100px',
        colorPickerWidth: '160px',
        colorPickerHeight: '100px',
        monitorHeight: '60px',
        titleBarHeight: '39px',
        panelTopPadding: '10px',
        panelBottomPadding: '10px',
      }),
    },
    { store: sizesStore }
  )

  const borderWidths = useControls(
    {
      borderWidths: folder({
        root: '0px',
        input: '0px',
        focus: '1px',
        hover: '1px',
        active: '1px',
        folder: '1px',
        graphLine: { value: '2px' },
        graphShadow: { value: '14px' },
      }),
    },
    { store: borderWidthsStore }
  )

  const fontWeights = useControls(
    {
      fontWeights: folder({
        label: { value: 'normal', options: ['bold', 'light'] },
        folder: { value: 'normal', options: ['bold', 'light'] },
        button: { value: 'normal', options: ['bold', 'light'] },
      }),
    },
    { store: fontWeightsStore }
  )

  const glassRaw = useControls(
    {
      glass: folder({
        enabled: false,
        invert: false,
        opacity: { value: 0.6, min: 0, max: 1, step: 0.01 },
        blur: { value: 12, min: 0, max: 60, step: 1 },
        vibrancy: { value: 1.2, min: 0.5, max: 3, step: 0.05 },
      }),
    },
    { store: glassStore }
  )

  const shadows = useControls(
    {
      shadows: folder({
        panelX: { value: 0, min: -40, max: 40, step: 1, label: 'offset x' },
        panelY: { value: 0, min: -40, max: 40, step: 1, label: 'offset y' },
        panelBlur: { value: 9, min: 0, max: 60, step: 1, label: 'blur' },
        panelSpread: { value: 0, min: -20, max: 40, step: 1, label: 'spread' },
        panelColor: { value: 'rgba(0, 0, 0, 0.53)', label: 'color' },
      }),
    },
    { store: shadowsStore }
  )

  // Builds a flattened theme snapshot from current control values. Called
  // once at mount for <Flux theme={...}> (Flux merges theme at mount —
  // live theme updates would require a remount, same as preact-era).
  const buildTheme = () => ({
    colors: colors(),
    radii: radii(),
    space: space(),
    fontSizes: fontSizes(),
    sizes: sizes(),
    borderWidths: borderWidths(),
    fontWeights: fontWeights(),
    shadows: {
      panelX: `${shadows().panelX}px`,
      panelY: `${shadows().panelY}px`,
      panelBlur: `${shadows().panelBlur}px`,
      panelSpread: `${shadows().panelSpread}px`,
      panelColor: shadows().panelColor,
    },
    glass: {
      enabled: String(glassRaw().enabled),
      invert: glassRaw().invert ? '1' : '0',
      opacity: String(glassRaw().opacity),
      blur: `${glassRaw().blur}px`,
      vibrancy: String(glassRaw().vibrancy),
    },
  })

  const theme = buildTheme()

  return (
    <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%,  #f9f9f9 100%, #8a8a8c 100%)', minHeight: '100vh' }}>
      <Flux theme={theme} />
      <div
        style={{
          display: 'grid',
          width: 300,
          gap: 10,
          paddingBottom: 40,
          marginRight: 10,
          float: 'left',
          background: '#181C20',
        }}>
        <FluxPanel fill flat titleBar={false} store={colorsStore} />
        <FluxPanel fill flat titleBar={false} store={radiiStore} />
        <FluxPanel fill flat titleBar={false} store={spaceStore} />
        <FluxPanel fill flat titleBar={false} store={fontSizesStore} />
        <FluxPanel fill flat titleBar={false} store={sizesStore} />
        <FluxPanel fill flat titleBar={false} store={borderWidthsStore} />
        <FluxPanel fill flat titleBar={false} store={fontWeightsStore} />
        <FluxPanel fill flat titleBar={false} store={shadowsStore} />
        <FluxPanel fill flat titleBar={false} store={glassStore} />
      </div>
      <pre>{() => JSON.stringify(buildTheme(), null, '  ')}</pre>
      <Controls />
    </div>
  )
}
