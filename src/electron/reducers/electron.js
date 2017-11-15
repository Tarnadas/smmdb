import { List, Map, fromJS } from 'immutable'

import fs from 'fs'
import path from 'path'

export const CEMU_SAVE_DATA = {
  smmdb: {},
  save: {}
}

export default function electron (state, action) {
  if (!action) return state
  try {
    switch (action.type) {
      case 'ADD_SAVE':
        let cemuSaveData = state.getIn(['appSaveData', 'cemuSaveData']).push(fromJS(Object.assign(CEMU_SAVE_DATA, { path: action.cemuSavePath })))
        state = state.setIn(['appSaveData', 'cemuSaveData'], cemuSaveData)
        state = state.set('currentSave', cemuSaveData.size - 1)
        saveState(state)
        return state
      case 'DELETE_SAVE':
        state = state.setIn(['appSaveData', 'cemuSaveData'], state.getIn(['appSaveData', 'cemuSaveData']).delete(action.saveId))
        saveState(state)
        return state
      case 'LOAD_SAVE':
        state = state.set('cemuSave', action.cemuSave)
        state = state.set('currentSave', action.saveId)
        return state
      case 'UNLOAD_SAVE':
        state = state.delete('cemuSave')
        state = state.delete('currentSave')
        return state
      case 'ADD_API_KEY':
        state = state.setIn(['appSaveData', 'apiKey'], action.apiKey)
        saveState(state)
        return state
      case 'DELETE_API_KEY':
        state = state.deleteIn(['appSaveData', 'apiKey'])
        return state
      case 'SET_SAVE_DATA':
        state = state.setIn(['appSaveData', 'cemuSaveData', state.get('currentSave'), 'save'], action.save)
        saveState(state)
        return state
      case 'SET_SAVE_COURSE':
        state = state.setIn(
          ['appSaveData', 'cemuSaveData', state.get('currentSave'), 'save', String(action.courseId)],
          action.course)
        saveState(state)
        return state
      case 'START_DOWNLOAD_COURSE':
        state = state.setIn(['currentDownloads', action.courseId], List([0, action.dataLength]))
        return state
      case 'PROGRESS_DOWNLOAD_COURSE':
        state = state.setIn(
          ['currentDownloads', action.courseId, '0'],
          state.getIn(['currentDownloads', action.courseId, '0']) + action.dataLength)
        return state
      case 'FINISH_DOWNLOAD_COURSE':
        state = state.setIn(
          ['currentDownloads', action.smmdbId, '0'],
          state.getIn(['currentDownloads', action.smmdbId, '1']))
        state = state.setIn(['appSaveData', 'downloads', action.smmdbId], Map(action.course))
        saveState(state)
        return state
      case 'FINISH_ADD_COURSE':
        if (state.getIn(['appSaveData', 'cemuSaveData', state.get('currentSave'), 'smmdb', String(action.smmdbId), 'saveId'])) {
          return state
        }
        if (!action.success) {
          state = state.set('saveFull', true)
          return state
        }
        state = state.setIn(['appSaveData', 'cemuSaveData', state.get('currentSave'), 'smmdb', String(action.smmdbId), 'saveId'], action.courseId)
        state = state.setIn(['appSaveData', 'cemuSaveData', state.get('currentSave'), 'save', String(action.courseId), 'smmdbId'], action.smmdbId)
        saveState(state)
        return state
      case 'FINISH_DELETE_COURSE':
        if (state.has('saveFull')) {
          state = state.set('saveFull', false)
        }
        state = state.set('forceUpdate', {})
        if (action.smmdbId) {
          state = state.deleteIn(['appSaveData', 'cemuSaveData', state.get('currentSave'), 'smmdb', String(action.smmdbId)])
        }
        state = state.deleteIn(['appSaveData', 'cemuSaveData', state.get('currentSave'), 'save', String(action.courseId)])
        saveState(state)
        return state
      case 'FINISH_DELETE_SELECTED':
        if (state.has('saveFull')) {
          state = state.set('saveFull', false)
        }
        state = state.set('forceUpdate', {})
        for (let i in action.smmdbIds) {
          state = state.deleteIn(['appSaveData', 'cemuSaveData', state.get('currentSave'), 'smmdb', String(action.smmdbIds[i])])
        }
        for (let i in action.courseIds) {
          state = state.deleteIn(['appSaveData', 'cemuSaveData', state.get('currentSave'), 'save', String(action.courseIds[i])])
        }
        saveState(state)
        return state
      case 'SET_SELECTED':
        state = state.set('selected', action.selected)
        return state
      case 'FILL_PROGRESS':
        state = state.set('fillProgress', List([action.progress, action.limit]))
        return state
    }
  } catch (err) {
    console.log(err)
  }
  return state
}

function saveState (state) {
  fs.writeFileSync(path.join(state.get('appSavePath'), 'save.json'), JSON.stringify(state.get('appSaveData'), null, 2))
}
