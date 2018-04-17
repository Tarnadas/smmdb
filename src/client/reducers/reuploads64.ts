import { fromJS } from 'immutable'

export function reuploads64 (state: any, action: any) {
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
