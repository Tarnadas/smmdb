import React from 'react'
import {
  Provider
} from 'react-redux'
import {
  Route, StaticRouter
} from 'react-router-dom'
import {
  ConnectedRouter
} from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'

import initReducer from '../client/reducers'
import AppView from '../client/components/views/AppView'

import { ScreenSize } from '../client/reducers/mediaQuery'
import {
  setCourses, setStats, mediaQuery
} from '../client/actions'

export default function renderer (isServer = false, cb, preloadedState, req, courses, stats, isMobile) {
  const history = isServer ? null : createHistory()

  const store = initReducer(preloadedState, history)
  if (isServer) {
    store.dispatch(setCourses(courses, false))
    store.dispatch(setStats(stats))
    if (isMobile) store.dispatch(mediaQuery(ScreenSize.SMALL))
  }

  const context = {}
  const jsx = <Provider store={store}>
    {
      isServer ? (
        <StaticRouter location={req.url} context={context}>
          <Route path='/' render={() => (
            <AppView isServer />
          )} />
        </StaticRouter>
      ) : (
        <ConnectedRouter history={history}>
          <Route path='/' component={AppView} />
        </ConnectedRouter>
      )
    }
  </Provider>
  const html = cb(jsx, !isServer && document.getElementById('root')
  )
  return [html, store.getState()]
}
