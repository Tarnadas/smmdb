import "regenerator-runtime/runtime"

import React from 'react'
import ReactDOM from 'react-dom'
import {
    Provider
} from 'react-redux'

import Socket      from './socket'
import initReducer from './reducers'
import AppView     from './components/views/AppView'

export const domain = 'http://tarnadas.ddns.net:3000';

const socket = new Socket();
const store = initReducer(socket);
socket.setStore(store);

ReactDOM.render(
    <Provider store={store}>
        <AppView />
    </Provider>,
    document.getElementById('root')
);