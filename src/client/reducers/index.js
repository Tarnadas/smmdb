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
import filter from './filter'
import showFilter from './showFilter'
import userData from './userData'
import mediaQuery from './mediaQuery'

import electron from '../../electron/reducers/electron'

const APP_SAVE_DATA = {
  cemuSavePath: [],
  apiKey: ''
}

export default function initReducer (preloadedState, history, appSaveData = APP_SAVE_DATA) {
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
    filter: {
      nextFilter: {},
      currentFilter: {}
    },
    showFilter: false,
    userData: {
      accountData: {}
    },
    mediaQuery: {
      screenSize: 2
    }
  })
  let reducers = {
    router,
    chat,
    stats,
    courseData,
    uploads,
    filter,
    showFilter,
    userData,
    mediaQuery
  }
  if (process.env.ELECTRON) {
    initialState = initialState.merge(fromJS({
      electron: {
        appSaveData,
        cemuSave: null,
        currentSave: 0
      }
    }))
    Object.assign(reducers, {
      electron
    })
  }
  return createStore(combineReducers(reducers), initialState, applyMiddleware(routerMiddleware(history)))
}
