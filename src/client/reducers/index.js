import {
  createStore, applyMiddleware
} from 'redux'
import {
  combineReducers
} from 'redux-immutable'
import {
  fromJS
} from 'immutable'
import {
  routerMiddleware
} from 'react-router-redux'

import router from './router'
import chat from './chat'
import stats from './stats'
import courseData from './courseData'
import uploads from './uploads'
import reuploads from './reuploads'
import filter from './filter'
import order from './order'
import userData from './userData'
import mediaQuery from './mediaQuery'
import amazon from './amazon'

import electron from '../../electron/reducers/electron'

const APP_SAVE_DATA = {
  cemuSaveData: [],
  apiKey: '',
  downloads: {}
}

export default function initReducer (preloadedState, history, electronSave, electronMiddleware, saveFileEditor) {
  let initialState = preloadedState || fromJS({
    router: {
      location: null
    },
    chat: {
      global: {}
    },
    stats: {},
    courseData: {
      main: [],
      self: [],
      uploaded: []
    },
    uploads: {},
    reuploads: {},
    filter: {
      nextFilter: {},
      currentFilter: {}
    },
    order: {
      order: 'lastmodified',
      dir: 0
    },
    userData: {
      accountData: {}
    },
    mediaQuery: {
      screenSize: 2
    },
    amazon: []
  })
  let reducers = {
    router,
    chat,
    stats,
    courseData,
    uploads,
    reuploads,
    filter,
    order,
    userData,
    mediaQuery,
    amazon
  }
  if (process.env.ELECTRON) {
    const appSaveData = electronSave.appSaveData || APP_SAVE_DATA
    appSaveData.version = process.env.CLIENT_VERSION
    const appSavePath = electronSave.appSavePath || ''
    initialState = initialState.merge(fromJS({
      electron: {
        appSaveData,
        appSavePath,
        cemuSave: null,
        currentSave: null,
        currentDownloads: {},
        saveFileEditor,
        selected: [],
        fillProgress: []
      }
    }))
    Object.assign(reducers, {
      electron
    })
  }
  const middleware = process.env.ELECTRON ? applyMiddleware(routerMiddleware(history), electronMiddleware) : applyMiddleware(routerMiddleware(history))
  return createStore(combineReducers(reducers), initialState, middleware)
}
