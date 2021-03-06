import { createStore, applyMiddleware } from 'redux'
import { Store } from 'react-redux'
import { combineReducers } from 'redux-immutable'
import { fromJS } from 'immutable'
import { routerMiddleware } from 'react-router-redux'

import { router } from './router'
import { chat } from './chat'
import { stats } from './stats'
import { courseData } from './courseData'
import { uploads } from './uploads'
import { uploads64 } from './uploads64'
import { reuploads } from './reuploads'
import { reuploads64 } from './reuploads64'
import { image } from './image'
import { blog } from './blog'
import { filter } from './filter'
import { order } from './order'
import { userData } from './userData'
import { mediaQuery } from './mediaQuery'
import { State } from '../models/State'

export function initReducer (preloadedState: any, history: any): Store<State> {
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
      main64: [],
      self: [],
      self64: [],
      uploaded: [],
      uploaded64: []
    },
    uploads: {},
    uploads64: {},
    reuploads: {},
    reuploads64: {},
    image: {
      full: {},
      prev: {},
      n64: {}
    },
    blog: {},
    filter: {
      nextFilter: {},
      currentFilter: {}
    },
    order: {
      order: 'lastmodified',
      dir: false
    },
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
    uploads64,
    reuploads,
    reuploads64,
    image,
    blog,
    filter,
    order,
    userData,
    mediaQuery
  }
  const middleware = applyMiddleware(routerMiddleware(history))
  return createStore(combineReducers(reducers), initialState, middleware)
}
