import * as React from 'react'
import { Provider } from 'react-redux'
import { Route, StaticRouter } from 'react-router-dom'
import { ConnectedRouter } from 'react-router-redux'
import { createBrowserHistory } from 'history'
import { preloadReady } from 'react-loadable'

import { initReducer } from '../client/reducers'
import { AppView } from '../client/components/views/AppView'

import { ScreenSize } from '../client/reducers/mediaQuery'
import { setCourses, setCourses64, setStats, mediaQuery } from '../client/actions'

export default async function renderer (isServer = false, reactRenderer: any, preloadedState: any, req?: any, courses?: any, courses64?: any, stats?: any, isPhone?: any, isTablet?: any): Promise<any> {
  const history = isServer ? null : createBrowserHistory()

  const store = initReducer(preloadedState, history)
  let Capture: any
  if (isServer) {
    store.dispatch(setCourses(courses.map((course: any): any => course.toJSON()), false))
    store.dispatch(setCourses64(courses64.map((course: any): any => course.toJSON()), false))
    store.dispatch(setStats(stats))
    if (isPhone) store.dispatch(mediaQuery(ScreenSize.SUPER_SMALL))
    else if (isTablet) store.dispatch(mediaQuery(ScreenSize.SMALL))
    Capture = require('react-loadable').Capture
  }

  const context = {}
  const modules: any[] = []
  const _jsx = <Provider store={store}>
    {
      isServer
        ? <StaticRouter location={req.url} context={context}>
          <Route path='/' render={(): JSX.Element => (
            <AppView isServer />
          )} />
        </StaticRouter>
        : <ConnectedRouter history={history!}> {/* eslint-disable-line typescript/no-non-null-assertion */}
          <Route path='/' component={AppView} />
        </ConnectedRouter>
    }
  </Provider>
  const jsx = isServer
    ? <Capture report={(moduleName: any): any => {
      modules.push(moduleName)
    }}>
      { _jsx }
    </Capture>
    : _jsx

  if (!isServer) {
    await preloadReady()
  }
  const html = reactRenderer(jsx, !isServer && document.getElementById('root'))
  return [html, store.getState(), modules]
}
