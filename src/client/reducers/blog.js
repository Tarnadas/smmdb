import {
  fromJS
} from 'immutable'

export default function blog (state, action) {
  if (!action) return state
  switch (action.type) {
    case 'SET_BLOG_UPLOAD':
      state = state.set(action.id, fromJS(action.upload))
      return state
    case 'DELETE_BLOG_UPLOAD':
      state = state.delete(action.id)
      return state
  }
  return state
}
