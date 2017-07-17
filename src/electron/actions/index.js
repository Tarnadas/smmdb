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

export function downloadCourse (courseId, modified) {
  return {
    type: 'SAVE_DOWNLOAD_COURSE',
    courseId,
    modified
  }
}

export function startDownloadCourse (courseId, dataLength) {
  return {
    type: 'START_DOWNLOAD_COURSE',
    courseId,
    dataLength
  }
}

export function progressDownloadCourse (courseId, dataLength) {
  return {
    type: 'PROGRESS_DOWNLOAD_COURSE',
    courseId,
    dataLength
  }
}

export function finishDownloadCourse (course, smmdbId) {
  return {
    type: 'FINISH_DOWNLOAD_COURSE',
    course,
    smmdbId
  }
}
