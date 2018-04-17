import { Map } from 'immutable'

export const DOWNLOAD_FORMAT = {
  WII_U: 0,
  N3DS: 1,
  PROTOBUF: 2
}

export function userData (state: any, action: any) {
  if (!action) return state
  switch (action.type) {
    case 'SET_ACCOUNT_DATA':
      state = state.set('accountData', action.accountData ? Map(action.accountData) : Map())
      return state
    case 'SET_VIDEO_ID':
      state = state.set('videoId', action.videoId)
      return state
  }
  return state
}
