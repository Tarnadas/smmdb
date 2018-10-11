import { Map } from 'immutable'

import { State } from '../models/State'

export function filter (state: any, action: any): State {
  if (!action) return state
  switch (action.type) {
    case 'SET_FILTER':
      state = state.set('nextFilter', Map(action.filter))
      return state
    case 'APPLY_FILTER':
      state = state.set('currentFilter', state.get('nextFilter'))
      return state
    case 'RESET_FILTER':
      state = state.set('nextFilter', Map())
      state = state.set('currentFilter', Map())
      return state
  }
  return state
}
