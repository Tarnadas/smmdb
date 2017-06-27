import 'babel-polyfill'

import {
    render
} from 'react-dom'
import {
    fromJS
} from 'immutable'

import renderer from '../shared/renderer'

const preloadedState = fromJS(window.__PRELOADED_STATE__);
delete window.__PRELOADED_STATE__;
//console.log(preloadedState.toJS());

renderer(false, render, preloadedState);