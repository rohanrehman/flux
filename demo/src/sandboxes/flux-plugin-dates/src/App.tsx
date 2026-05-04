import { date } from '@flux-ui/plugin-dates'
import { useControls } from 'flux'

export default function App() {
  const data = useControls({
    birthday: date({
      date: new Date(),
      locale: 'en-UK',
      inputFormat: 'dd.MM.yyyy',
    }),
  })

  return <div className="App">{() => data().birthday.formattedDate}</div>
}
