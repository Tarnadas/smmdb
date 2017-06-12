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
import userData   from './userData'

export default function initReducer(s) {
    const initialState = Map({
        socket: s,
        chat: Map({
            global: Map()
        }),
        courseData: List(),
        userData: Map()
    });
    const reducer = combineReducers({
        socket,
        chat,
        courseData,
        userData
    }, initialState);
    return createStore(reducer, initialState);
}