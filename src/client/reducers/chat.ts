export function chat (state: any, action: any) {
  if (!action) return state
  switch (action.type) {
    case 'ADD_CHAT_MESSAGE_GLOBAL':
      state = state.setIn(['global', action.timestamp], {
        userName: action.userName,
        message: action.message
      })
      return state
  }
  return state
}
