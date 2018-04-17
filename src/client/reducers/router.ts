import { LOCATION_CHANGE } from 'react-router-redux'

export function router (state: any, action: any) {
  if (action.type === LOCATION_CHANGE) {
    return state.set('location', action.payload)
  }
  return state
}
