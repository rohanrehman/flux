import type { JSX } from 'preact'

export function getDefaultTheme() {
  return {
    colors: {
      elevation1: '#000000',
      elevation2: '#181c20',
      elevation3: '#373c4b',
      accent1: '#0066dc',
      accent2: '#ff00d7',
      accent3: '#3c93ff',
      highlight1: '#535760',
      highlight2: '#8c92a4',
      highlight3: '#fefefe',
      highlight4: '#fefefe',
      vivid1: '#ffcc00',
      folderWidgetColor: '$highlight2',
      folderTextColor: '$highlight3',
      toolTipBackground: '$highlight3',
      toolTipText: '$elevation2',
    },
    radii: {
      xs: '2px',
      sm: '3px',
      lg: '10px',
    },
    space: {
      xs: '3px',
      sm: '6px',
      md: '14px',
      rowGap: '7px',
      colGap: '7px',
    },
    fonts: {
      mono: `ui-monospace, SFMono-Regular, Menlo, 'Roboto Mono', monospace`,
      sans: `system-ui, sans-serif`,
    },
    fontSizes: {
      root: '11px',
      toolTip: '$root',
    },
    sizes: {
      rootWidth: '280px',
      panelTopPadding: '10px',
      panelBottomPadding: '10px',
      controlWidth: '160px',
      numberInputMinWidth: '52px',
      scrubberWidth: '0px',
      scrubberHeight: '0px',
      rowHeight: '24px',
      folderTitleHeight: '20px',
      checkboxSize: '16px',
      joystickWidth: '100px',
      joystickHeight: '100px',
      colorPickerWidth: '$controlWidth',
      colorPickerHeight: '100px',
      imagePreviewWidth: '$controlWidth',
      imagePreviewHeight: '100px',
      monitorHeight: '60px',
      titleBarHeight: '39px',
    },
    shadows: {
      level1: '0 0 9px 0 #00000088',
      level2: '0 4px 14px #00000033',
      panelX: '0px',
      panelY: '0px',
      panelBlur: '9px',
      panelSpread: '0px',
      panelColor: '#00000088',
    },
    borderWidths: {
      root: '0px',
      input: '1px',
      focus: '1px',
      hover: '1px',
      active: '1px',
      folder: '1px',
      graphLine: '2px',
      graphShadow: '14px',
    },
    fontWeights: {
      label: 'normal',
      folder: 'normal',
      button: 'normal',
    },
    glass: {
      enabled: 'false',
      opacity: '0.6',
      blur: '12px',
      vibrancy: '1.2',
      invert: '0',
    },
  }
}

export type FullTheme = ReturnType<typeof getDefaultTheme>
export type FluxCustomTheme = Partial<{ [k in keyof FullTheme]: Partial<FullTheme[k]> }>

/** Resolve a value that may be a `$reference` within the same category. */
function resolveRef<C extends keyof FullTheme>(theme: FullTheme, category: C, key: keyof FullTheme[C]): string {
  let _key = key
  while (true) {
    const value = (theme[category] as Record<string, string>)[_key as string]
    if (typeof value === 'string' && value.charAt(0) === '$') {
      _key = value.slice(1) as keyof FullTheme[C]
    } else {
      return value
    }
  }
}

/** Convert a theme object to a flat CSS-variable style object. */
function themeToCSSVars(theme: FullTheme): JSX.CSSProperties {
  const vars: Record<string, string> = {}
  for (const category of Object.keys(theme) as (keyof FullTheme)[]) {
    for (const key of Object.keys(theme[category] as object)) {
      const value = resolveRef(theme, category, key as keyof FullTheme[typeof category])
      vars[`--flux-${category}-${key}`] = value
    }
  }
  return vars as JSX.CSSProperties
}

export function mergeTheme(newTheme?: FluxCustomTheme): { theme: FullTheme; style: JSX.CSSProperties } {
  const theme = getDefaultTheme()
  if (newTheme) {
    for (const category of Object.keys(newTheme) as (keyof FluxCustomTheme)[]) {
      Object.assign(theme[category], newTheme[category])
    }
  }
  return { theme, style: themeToCSSVars(theme) }
}
