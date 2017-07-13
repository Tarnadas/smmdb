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
import {
  remote
} from 'electron'
import createHistory from 'history/createMemoryHistory'

import initReducer from '../client/reducers'
import ElectronView from './components/views/ElectronView'

const history = createHistory()
const save = remote.getGlobal('save')
const store = initReducer(null, history, save)

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Route path='/' component={ElectronView} />
    </ConnectedRouter>
  </Provider>, document.getElementById('root')
)
