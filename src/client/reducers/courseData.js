import {
  fromJS
} from 'immutable'

export const DIFFICULTY = {
  EASY: 0,
  NORMAL: 1,
  EXPERT: 2,
  SUPER_EXPERT: 3
}
export const N64_THEME = {
  NONE: 0,
  CAVE: 1,
  FACTORY: 2,
  DESERT: 3,
  SNOW: 4,
  VOID: 5,
  LAVA: 6,
  BEACH: 7,
  GRASS: 8,
  LAVAROOM: 9,
  SKY: 10,
  FORTRESS: 11
}

export default function courseData (state, action) {
  if (!action) return state
  switch (action.type) {
    case 'SET_COURSE':
      state = state.setIn(['main', action.id], fromJS(action.course))
      return state
    case 'SET_COURSE64':
      state = state.setIn(['main64', action.id], fromJS(action.course))
      return state
    case 'SET_COURSES':
      if (action.concat) {
        let list = state.get('main').concat(fromJS(action.courses))
        const a = []
        list = list.filter(x => {
          if (!a.includes(x.get('id'))) {
            a.push(x.get('id'))
            return true
          }
          return false
        })
        state = state.set('main', list)
      } else {
        state = state.set('main', fromJS(action.courses))
      }
      return state
    case 'SET_COURSES64':
      if (action.concat) {
        let list = state.get('main64').concat(fromJS(action.courses))
        const a = []
        list = list.filter(x => {
          if (!a.includes(x.get('id'))) {
            a.push(x.get('id'))
            return true
          }
          return false
        })
        state = state.set('main64', list)
      } else {
        state = state.set('main64', fromJS(action.courses))
      }
      return state
    case 'DELETE_COURSE':
      state = state.deleteIn(['main', action.courseId])
      return state
    case 'DELETE_COURSE64':
      state = state.deleteIn(['main64', action.courseId])
      return state
    case 'SET_COURSE_SELF':
      state = state.setIn(['self', action.id], fromJS(action.course))
      return state
    case 'SET_COURSE_SELF64':
      state = state.setIn(['self64', action.id], fromJS(action.course))
      return state
    case 'SET_COURSES_SELF':
      let list
      if (action.concat) {
        list = state.get('self').concat(fromJS(action.courses))
      } else {
        list = fromJS(action.courses)
      }
      const a = state.get('uploaded').map(course => course.id).toJS()
      list = list.filter(x => {
        if (!a.includes(x.get('id'))) {
          a.push(x.get('id'))
          return true
        }
        return false
      })
      state = state.set('self', list)
      return state
    case 'SET_COURSES_SELF64':
      let list64
      if (action.concat) {
        list64 = state.get('self64').concat(fromJS(action.courses))
      } else {
        list64 = fromJS(action.courses)
      }
      const b = state.get('uploaded64').map(course => course.id).toJS()
      list64 = list64.filter(x => {
        if (!b.includes(x.get('id'))) {
          b.push(x.get('id'))
          return true
        }
        return false
      })
      state = state.set('self64', list64)
      return state
    case 'DELETE_COURSE_SELF':
      state = state.deleteIn(['self', action.courseId])
      return state
    case 'DELETE_COURSE_SELF64':
      state = state.deleteIn(['self64', action.courseId])
      return state
    case 'SET_COURSE_UPLOADED':
      state = state.setIn(['uploaded', action.id], fromJS(action.course))
      return state
    case 'SET_COURSE_UPLOADED64':
      state = state.setIn(['uploaded64', action.id], fromJS(action.course))
      return state
    case 'SET_COURSES_UPLOADED':
      if (action.concat) {
        state = state.set('uploaded', state.get('uploaded').concat(fromJS(action.courses)))
      } else {
        state = state.set('uploaded', fromJS(action.courses))
      }
      return state
    case 'SET_COURSES_UPLOADED64':
      if (action.concat) {
        state = state.set('uploaded64', state.get('uploaded64').concat(fromJS(action.courses)))
      } else {
        state = state.set('uploaded64', fromJS(action.courses))
      }
      return state
    case 'DELETE_COURSE_UPLOADED':
      state = state.deleteIn(['uploaded', action.courseId])
      return state
    case 'DELETE_COURSE_UPLOADED64':
      state = state.deleteIn(['uploaded64', action.courseId])
      return state
  }
  return state
}
