import { date } from '@flux-ui/plugin-dates'
import { useControls, Flux } from 'flux'

export default function App() {
  const data = useControls({
    birthday: date({
      date: new Date(),
      locale: 'en-UK',
      inputFormat: 'dd.MM.yyyy',
    }),
  })

  return (
    <div className="App">
      <Flux titleBar={false} />
      {() => data().birthday.formattedDate}
    </div>
  )
}
