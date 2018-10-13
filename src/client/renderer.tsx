import '@babel/polyfill'

import { hydrate } from 'react-dom'
import { fromJS } from 'immutable'

import renderer from '../shared/renderer'

const preloadedState = fromJS((window as any).__PRELOADED_STATE__)
delete (window as any).__PRELOADED_STATE__

renderer(false, hydrate, preloadedState)
