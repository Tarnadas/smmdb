import { fromJS } from 'immutable'

export default function image (state, action) {
  if (!action) return state
  switch (action.type) {
    case 'SET_UPLOAD_IMAGE_FULL':
      state = state.setIn(['full', action.id], fromJS(action.upload))
      return state
    case 'DELETE_UPLOAD_IMAGE_FULL':
      state = state.deleteIn(['full', action.id])
      return state
    case 'SET_UPLOAD_IMAGE_PREVIEW':
      state = state.setIn(['prev', action.id], fromJS(action.upload))
      return state
    case 'DELETE_UPLOAD_IMAGE_PREVIEW':
      state = state.deleteIn(['prev', action.id])
      return state
    case 'SET_UPLOAD_IMAGE64':
      state = state.setIn(['n64', action.id], fromJS(action.upload))
      return state
    case 'DELETE_UPLOAD_IMAGE64':
      state = state.deleteIn(['n64', action.id])
      return state
  }
  return state
}
