export function addApiKey (apiKey) {
  return {
    type: 'ADD_API_KEY',
    apiKey
  }
}
export function deleteApiKey () {
  return {
    type: 'DELETE_API_KEY'
  }
}

export function addSave (cemuSavePath, cemuSave) {
  return {
    type: 'ADD_SAVE',
    cemuSavePath,
    cemuSave
  }
}

export function deleteSave (saveId) {
  return {
    type: 'DELETE_SAVE',
    saveId
  }
}

export function loadSave (cemuSave, saveId) {
  return {
    type: 'LOAD_SAVE',
    cemuSave,
    saveId
  }
}

export function unloadSave () {
  return {
    type: 'UNLOAD_SAVE'
  }
}

export function setSaveData (save) {
  return {
    type: 'SET_SAVE_DATA',
    save
  }
}

export function setSaveCourse (courseId, course) {
  return {
    type: 'SET_SAVE_COURSE',
    courseId,
    course
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

export function addCourse (courseId) {
  return {
    type: 'SAVE_ADD_COURSE',
    courseId
  }
}

export function updateCourse (courseId, smmdbId, modified) {
  return {
    type: 'SAVE_UPDATE_COURSE',
    courseId,
    smmdbId,
    modified
  }
}

export function finishAddCourse (smmdbId, courseId, success) {
  return {
    type: 'FINISH_ADD_COURSE',
    smmdbId,
    courseId,
    success
  }
}

export function deleteCourse (smmdbId, courseId) {
  return {
    type: 'SAVE_DELETE_COURSE',
    smmdbId,
    courseId
  }
}

export function finishDeleteCourse (smmdbId, courseId, success) {
  return {
    type: 'FINISH_DELETE_COURSE',
    smmdbId,
    courseId,
    success
  }
}

export function deleteSelected (selected) {
  return {
    type: 'SAVE_DELETE_SELECTED',
    selected
  }
}

export function finishDeleteSelected (courseIds, smmdbIds, success) {
  return {
    type: 'FINISH_DELETE_SELECTED',
    courseIds,
    smmdbIds,
    success
  }
}

export function setSelected (selected) {
  return {
    type: 'SET_SELECTED',
    selected
  }
}

export function fillSave () {
  return {
    type: 'FILL_SAVE'
  }
}

export function fillSaveRandom () {
  return {
    type: 'FILL_SAVE_RANDOM'
  }
}

export function fillProgress (progress, limit) {
  return {
    type: 'FILL_PROGRESS',
    progress,
    limit
  }
}
