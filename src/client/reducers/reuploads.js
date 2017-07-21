export default function reuploads (state, action) {
  if (!action) return state
  switch (action.type) {
    case 'SET_REUPLOAD':
      state = state.set(action.id, action.upload)
      return state
    case 'DELETE_REUPLOAD':
      state = state.delete(action.id)
      return state
  }
  return state
}
