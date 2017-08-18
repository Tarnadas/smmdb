import { List } from 'immutable'

export default function amazon (state, action) {
  if (!action) return state
  switch (action.type) {
    case 'SET_AMAZON_PRODUCTS':
      state = List(action.products)
      return state
  }
  return state
}
