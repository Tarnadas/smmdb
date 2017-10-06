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

import initReducer from './reducers'
import { initAccount } from '../shared/Account'
import ElectronView from './components/views/ElectronView'
import {
  setAccountData
} from '../client/actions'

(async () => {
  const history = createHistory()
  const save = remote.getGlobal('save')
  let account
  if (save != null && save.appSaveData != null && save.appSaveData.apiKey) {
    account = await initAccount(save.appSaveData.apiKey)
    if (!account) {
      save.appSaveData.apiKey = ''
    }
  }
  const store = initReducer(history, save)
  if (account) {
    store.dispatch(setAccountData(account))
  }

  render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Route path='/' component={ElectronView} />
      </ConnectedRouter>
    </Provider>, document.getElementById('root')
  )
})()
