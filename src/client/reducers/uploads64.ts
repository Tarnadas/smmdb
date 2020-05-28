import { fromJS } from 'immutable'

import { State } from '../models/State'

export function uploads64 (state: any, action: any): State {
  if (!action) return state
  switch (action.type) {
    case 'SET_UPLOAD64':
      state = state.set(action.id, fromJS(action.upload))
      return state
    case 'DELETE_UPLOAD64':
      state = state.delete(action.id)
      return state
  }
  return state
}
