import { render } from '@madenowhere/phaze'
import App from './App'

import '@rohanrehman/flux/dist/flux.core.css'
import './index.css'

// Phaze render takes a thunk (not a JSX element directly) and returns a
// dispose function — see Stage 1c.4 commit notes.
render(() => <App />, document.getElementById('root'))
