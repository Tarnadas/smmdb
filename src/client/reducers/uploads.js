export default function uploads (state, action) {
  if (!action) return state
  switch (action.type) {
    case 'SET_UPLOAD':
      state = state.set(action.id, action.upload)
      return state
    case 'DELETE_UPLOAD':
      state = state.delete(action.id)
      return state
  }
  return state
}
