import {
    createStore, applyMiddleware
} from 'redux'
import {
    combineReducers
} from 'redux-immutable'
import {
    Map, List, fromJS
} from 'immutable'
import {
    routerMiddleware
} from 'react-router-redux'

import router     from './router'
import socket     from './socket'
import chat       from './chat'
import stats      from './stats'
import courseData from './courseData'
import filter     from './filter'
import showFilter from './showFilter'
import userData   from './userData'
import mediaQuery from './mediaQuery'

export default function initReducer(preloadedState, history, s) {
    /*const initialState = Map({
        router: fromJS({
            location: null
        }),
        socket: s,
        chat: Map({
            global: Map()
        }),
        stats: Map(),
        courseData: List(),
        filter: Map({
            nextFilter: Map(),
            currentFilter: Map()
        }),
        showFilter: false,
        userData: Map({
            accountData: Map()
        }),
        mediaQuery: Map({
            screenSize: 2
        })
    });*/
    const initialState = fromJS({
        router: {
            location: null
        },
        socket: s,
        chat: {
            global: {}
        },
        stats: {},
        courseData: [],
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
    });
    const reducer = combineReducers({
        router,
        socket,
        chat,
        stats,
        courseData,
        filter,
        showFilter,
        userData,
        mediaQuery
    });
    return createStore(reducer, !!preloadedState ? preloadedState : initialState, applyMiddleware(routerMiddleware(history)));
}