export function addApiKey (apiKey) {
  return {
    type: 'ADD_API_KEY',
    apiKey
  }
}

export function addSave (cemuSavePath, cemuSave) {
  return {
    type: 'ADD_SAVE',
    cemuSavePath,
    cemuSave
  }
}

export function removeSave (cemuSavePath) {
  return {
    type: 'REMOVE_SAVE',
    cemuSavePath
  }
}

export function loadSave (cemuSave, saveId) {
  return {
    type: 'LOAD_SAVE',
    cemuSave,
    saveId
  }
}
