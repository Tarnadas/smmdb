import { fromJS } from 'immutable'

import { State } from '../models/State'

export function reuploads (state: any, action: any): State {
  if (!action) return state
  switch (action.type) {
    case 'SET_REUPLOAD':
      state = state.set(action.id, fromJS(action.upload))
      return state
    case 'DELETE_REUPLOAD':
      state = state.delete(action.id)
      return state
  }
  return state
}
