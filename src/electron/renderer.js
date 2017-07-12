import React from 'react'
import {
  render
} from 'react-dom'
import {
  Provider
} from 'react-redux'
import {
  Route
} from 'react-router-dom'
import {
  ConnectedRouter
} from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'

import initReducer from '../client/reducers'
import ElectronView from './components/views/ElectronView'

const history = createHistory()

const store = initReducer(null, history)

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Route path='/' component={ElectronView} />
    </ConnectedRouter>
  </Provider>, document.getElementById('root')
)
