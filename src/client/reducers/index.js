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

import router     from './router'
import chat       from './chat'
import stats      from './stats'
import courseData from './courseData'
import filter     from './filter'
import showFilter from './showFilter'
import userData   from './userData'
import mediaQuery from './mediaQuery'

export default function initReducer(preloadedState, history) {
    const initialState = fromJS({
        router: {
            location: null
        },
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