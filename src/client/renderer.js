import 'babel-polyfill'

import {
  hydrate
} from 'react-dom'
import {
  fromJS
} from 'immutable'

import renderer from '../shared/renderer'

const preloadedState = fromJS(window.__PRELOADED_STATE__)
/* const courseData = Object.assign({}, window.__PRELOADED_STATE__.courseData)
window.__PRELOADED_STATE__.courseData = {}
let preloadedState = fromJS(window.__PRELOADED_STATE__)
for (let i in courseData) {
  let list = List()
  for (let j in courseData[i]) {
    list = list.push(courseData[i][j])
  }
  preloadedState = preloadedState.setIn(['courseData', i], list)
} */
delete window.__PRELOADED_STATE__

renderer(false, hydrate, preloadedState)
