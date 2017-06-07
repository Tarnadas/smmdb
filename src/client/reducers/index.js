import {
    createStore
} from 'redux';
import {
    combineReducers
} from 'redux-immutable';
import {
    Map
} from 'immutable';

import chat     from './chat';

export default function initReducer(s) {
    const initialState = Map({
        chat: Map({
            global: Map()
        })
    });
    const reducer = combineReducers({
        chat
    }, initialState);
    return createStore(reducer, initialState);
}