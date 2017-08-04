import {
  List
} from 'immutable'

export const DIFFICULTY = {
  EASY: 0,
  NORMAL: 1,
  EXPERT: 2,
  SUPER_EXPERT: 3
}

export default function courseData (state, action) {
  if (!action) return state
  switch (action.type) {
    case 'SET_COURSE':
      state = state.setIn(['main', action.id], action.course)
      return state
    case 'SET_COURSES':
      if (action.concat) {
        // if (action.courses.length === 0) return state
        let list = state.get('main').concat(action.courses)
        const a = []
        list = list.filter(x => {
          if (!a.includes(x.id)) {
            a.push(x.id)
            return true
          }
          return false
        })
        state = state.set('main', list)
      } else {
        state = state.set('main', List(action.courses))
      }
      return state
    case 'DELETE_COURSE':
      state = state.deleteIn(['main', action.courseId])
      return state
    case 'SET_COURSE_SELF':
      state = state.setIn(['self', action.id], action.course)
      return state
    case 'SET_COURSES_SELF':
      // if (action.courses.length === 0) return state
      let list
      if (action.concat) {
        list = state.get('self').concat(action.courses)
      } else {
        list = List(action.courses)
      }
      const a = state.get('uploaded').map(course => course.id).toJS()
      list = list.filter(x => {
        if (!a.includes(x.id)) {
          a.push(x.id)
          return true
        }
        return false
      })
      state = state.set('self', list)
      return state
    case 'DELETE_COURSE_SELF':
      state = state.deleteIn(['self', action.courseId])
      return state
    case 'SET_COURSE_UPLOADED':
      state = state.setIn(['uploaded', action.id], action.course)
      return state
    case 'SET_COURSES_UPLOADED':
      if (action.concat) {
        state = state.set('uploaded', state.get('uploaded').concat(action.courses))
      } else {
        state = state.set('uploaded', List(action.courses))
      }
      return state
    case 'DELETE_COURSE_UPLOADED':
      state = state.deleteIn(['uploaded', action.courseId])
      return state
  }
  return state
}
