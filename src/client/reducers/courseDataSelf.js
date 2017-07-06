import {
  List
} from 'immutable'

export default function courseDataSelf (state, action) {
  if (!action) return state
  switch (action.type) {
    case 'SET_COURSE_SELF':
      state = state.set(action.id, action.course)
      return state
    case 'SET_COURSES_SELF':
      if (action.concat) {
        state = state.concat(action.courses)
      } else {
        state = List(action.courses)
      }
      return state
    case 'DELETE_COURSE_SELF':
      state = state.delete(action.courseId)
      return state
  }
  return state
}
