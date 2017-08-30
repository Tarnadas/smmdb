import {
  fromJS
} from 'immutable'

export default function uploads (state, action) {
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
