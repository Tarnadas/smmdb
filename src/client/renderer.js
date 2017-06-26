import 'babel-polyfill'

import React from 'react'
import ReactDOM from 'react-dom'
import {
    Provider
} from 'react-redux'
import {
    Route
} from 'react-router-dom'
import {
    ConnectedRouter
} from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'

import Socket      from './socket'
import initReducer from './reducers'
import AppView     from './components/views/AppView'

const history = createHistory();

const socket = new Socket();
const store = initReducer(history, socket);
socket.setStore(store);

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <Route path="/" component={AppView} />
        </ConnectedRouter>
    </Provider>,
    document.getElementById('root')
);