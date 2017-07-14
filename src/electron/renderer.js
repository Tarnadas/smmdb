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
import got from 'got'
import createHistory from 'history/createMemoryHistory'

import { resolve } from 'url'

import initReducer from '../client/reducers'
import ElectronView from './components/views/ElectronView'
import saveFileMiddleware from './util/SaveFileMiddleware'
import SaveFileEditor from './util/SaveFileEditor'
import {
  setAccountData
} from '../client/actions'
import {
  domain
} from '../static'

const history = createHistory()
const save = remote.getGlobal('save')
const saveFileEditor = new SaveFileEditor(save.appSavePath, !!save.appSaveData && save.appSaveData.downloads)
const store = initReducer(null, history, save, saveFileMiddleware(saveFileEditor), saveFileEditor)

const initAccount = async apiKey => {
  try {
    const account = (await got(resolve(domain, '/api/getaccountdata'), {
      headers: {
        'Authorization': `APIKEY ${apiKey}`
      },
      json: true,
      useElectronNet: false
    })).body
    store.dispatch(setAccountData(account))
  } catch (err) {
    console.error(err.response.body)
  }
}
if (save != null && save.appSaveData != null && save.appSaveData.apiKey != null) {
  (async (apiKey) => {
    await initAccount(apiKey)
  })(save.appSaveData.apiKey)
}

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Route path='/' component={ElectronView} />
    </ConnectedRouter>
  </Provider>, document.getElementById('root')
)
