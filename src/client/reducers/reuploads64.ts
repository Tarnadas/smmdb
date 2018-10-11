import { fromJS } from 'immutable'

import { State } from '../models/State'

export function reuploads64 (state: any, action: any): State {
  if (!action) return state
  switch (action.type) {
    case 'SET_REUPLOAD64':
      state = state.set(action.id, fromJS(action.upload))
      return state
    case 'DELETE_REUPLOAD64':
      state = state.delete(action.id)
      return state
  }
  return state
}
