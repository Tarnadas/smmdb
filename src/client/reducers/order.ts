import { State } from '../models/State'

export function order (state: any, action: any): State {
  if (!action) return state
  switch (action.type) {
    case 'SET_ORDER':
      state = state.set('order', action.order || 'lastmodified')
      return state
    case 'SWAP_ORDER':
      state = state.set('dir', !state.get('dir'))
      return state
    case 'RESET_ORDER':
      state = state.set('order', 'lastmodified')
      state = state.set('dir', false)
  }
  return state
}
