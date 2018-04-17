import { Map } from 'immutable'

export function stats (state: any, action: any) {
  if (!action) return state
  switch (action.type) {
    case 'SET_STATS':
      state = Map(action.stats)
      return state
  }
  return state
}
