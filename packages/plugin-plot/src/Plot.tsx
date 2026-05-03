/** @jsxImportSource @madenowhere/phaze */
import { effect } from '@madenowhere/phaze'
import { useInputContext, useValues, Components } from '@rohanrehman/flux/plugin'
import { PlotCanvas } from './PlotCanvas'
import type { PlotProps } from './plot-types'
import { SyledInnerLabel, Container } from './StyledPlot'

const { Label, Row, String } = Components

export function Plot() {
  const { label, value, displayValue, settings, onUpdate, onChange, setSettings } = useInputContext<PlotProps>()

  const { graph } = settings

  // Reactive accessor — useValues returns a Computed of the symbol values.
  const scope = useValues(value.__symbols)

  // Re-evaluate whenever any of the tracked symbols change. The effect's
  // dep on scope() is the trigger; we re-run onUpdate with the current
  // displayValue snapshot so the input is recomputed against the new
  // scope.
  effect(() => {
    void scope()
    onUpdate(displayValue)
  })

  return (
    <>
      {graph && (
        <Row>
          <PlotCanvas value={value} settings={settings} />
        </Row>
      )}
      <Row input>
        <Label>{label}</Label>
        <Container>
          <SyledInnerLabel graph={graph} onClick={() => setSettings({ graph: !graph })}>
            𝑓
          </SyledInnerLabel>
          <String displayValue={displayValue} onUpdate={onUpdate} onChange={onChange} />
        </Container>
      </Row>
    </>
  )
}
