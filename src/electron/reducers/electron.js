import * as fs from 'fs'
import * as path from 'path'

export default function electron (state, action) {
  if (!action) return state
  let appSaveData, cemuSavePath
  try {
    switch (action.type) {
      case 'ADD_SAVE':
        cemuSavePath = state.getIn(['appSaveData', 'cemuSavePath']).push(action.cemuSavePath)
        state = state.setIn(['appSaveData', 'cemuSavePath'], cemuSavePath)
        state = state.set('currentSave', cemuSavePath.size - 1)
        saveState(state)
        return state
      case 'REMOVE_SAVE':
        appSaveData = state.get('appSaveData')
        cemuSavePath = appSaveData.get('cemuSavePath')
        let index = 0
        for (let i = 0; i < cemuSavePath.size; i++) {
          if (cemuSavePath.get(i) === action.cemuSavePath) {
            index = i
            break
          }
        }
        cemuSavePath = cemuSavePath.delete(index)
        appSaveData = appSaveData.set('cemuSavePath', cemuSavePath)
        state = state.set('appSaveData', appSaveData)
        saveState(state)
        return state
      case 'LOAD_SAVE':
        state = state.set('cemuSave', action.cemuSave)
        state = state.set('currentSave', action.saveId)
        return state
      case 'ADD_API_KEY':
        state = state.setIn(['appSaveData', 'apiKey'], action.apiKey)
        saveState(state)
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
