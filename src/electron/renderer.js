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
import { initAccount } from '../shared/Account'
import ElectronView from './components/views/ElectronView'
import saveFileMiddleware from './util/SaveFileMiddleware'
import SaveFileEditor from './util/SaveFileEditor'
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
  const saveFileEditor = new SaveFileEditor(save.appSavePath, !!save.appSaveData && save.appSaveData.downloads)
  const store = initReducer(null, history, save, saveFileMiddleware(saveFileEditor), saveFileEditor)
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
