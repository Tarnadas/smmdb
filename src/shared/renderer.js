import Promise from 'bluebird'

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
import get from 'simple-get'

import { resolve as resolveUrl } from 'url'

import initReducer from '../client/reducers'
import AppView     from '../client/components/views/AppView'

import { ScreenSize } from '../client/reducers/mediaQuery'
import {
    setCourses, setStats, mediaQuery
} from '../client/actions'
import { domain } from '../static'

export default function renderer (isServer = false, cb, preloadedState, req, courses, stats, isMobile) {
    const history = isServer ? null : createHistory();

    const store = initReducer(preloadedState, history);
    if (isServer) {
        store.dispatch(setCourses(courses, false));
        store.dispatch(setStats(stats));
        if (isMobile) store.dispatch(mediaQuery(ScreenSize.SMALL));
    }

    const context = {};
    const html = cb(
        <Provider store={store}>
            {
                isServer ? (
                    <StaticRouter location={req.url} context={context}>
                        <Route path="/" render={() => (
                            <AppView isServer />
                        )} />
                    </StaticRouter>
                ) : (
                    <ConnectedRouter history={history}>
                        <Route path="/" component={AppView} />
                    </ConnectedRouter>
                )
            }
        </Provider>,
        !isServer && document.getElementById('root')
    );
    return [html, store.getState()];
}

export async function getJson (method = 'GET', path, body) {
    return await new Promise((resolve, reject) => {
        get.concat({
            method,
            url: resolveUrl(domain, path),
            json: true,
            body
        }, (err, res, data) => {
            if (err) reject(err);
            resolve(data);
        })
    });
}