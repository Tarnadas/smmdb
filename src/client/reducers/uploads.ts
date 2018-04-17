import { fromJS } from 'immutable'

export function uploads (state: any, action: any) {
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
