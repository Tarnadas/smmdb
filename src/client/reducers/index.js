import {
    createStore
} from 'redux';
import {
    combineReducers
} from 'redux-immutable';
import {
    Map, List
} from 'immutable';

import socket     from './socket'
import chat       from './chat'
import courseData from './courseData'
import filter     from './filter'
import showFilter from './showFilter'
import userData   from './userData'

export default function initReducer(s) {
    const initialState = Map({
        socket: s,
        chat: Map({
            global: Map()
        }),
        courseData: List(),
        filter: Map({
            nextFilter: Map(),
            currentFilter: Map()
        }),
        showFilter: false,
        userData: Map({
            accountData: Map()
        })
    });
    const reducer = combineReducers({
        socket,
        chat,
        courseData,
        filter,
        showFilter,
        userData
    }, initialState);
    return createStore(reducer, initialState);
}