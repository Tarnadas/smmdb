import { fromJS } from 'immutable'

import { State } from '../models/State'

export function uploads (state: any, action: any): State {
  if (!action) return state
  switch (action.type) {
    case 'SET_UPLOAD':
      state = state.set(action.id, fromJS(action.upload))
      return state
    case 'DELETE_UPLOAD':
      state = state.delete(action.id)
      return state
  }
  return state
}
