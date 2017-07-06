export const ScreenSize = {
  SMALL: 0,
  MEDIUM: 1,
  LARGE: 2
}

export default function mediaQuery (state, action) {
  if (!action) return state
  switch (action.type) {
    case 'MEDIA_QUERY':
      state = state.set('screenSize', action.screenSize)
      return state
  }
  return state
}
