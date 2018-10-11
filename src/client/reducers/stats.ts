import { Map } from 'immutable'

import { State } from '../models/State'

export function stats (state: any, action: any): State {
  if (!action) return state
  switch (action.type) {
    case 'SET_STATS':
      state = Map(action.stats)
      return state
  }
  return state
}
