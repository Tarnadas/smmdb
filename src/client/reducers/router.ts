import { LOCATION_CHANGE } from 'react-router-redux'

import { State } from '../models/State'

export function router (state: any, action: any): State {
  if (action.type === LOCATION_CHANGE) {
    return state.set('location', action.payload)
  }
  return state
}
