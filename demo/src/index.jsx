import { render } from 'preact'
import { LocationProvider } from 'preact-iso'
import App from './App'

import 'flux/dist/flux.core.css'
import './index.css'

render(
  <LocationProvider>
    <App />
  </LocationProvider>,
  document.getElementById('root')
)
