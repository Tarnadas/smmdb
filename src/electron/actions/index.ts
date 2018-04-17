export function addApiKey (apiKey: any) {
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

export function addSave (cemuSavePath: any, cemuSave: any) {
  return {
    type: 'ADD_SAVE',
    cemuSavePath,
    cemuSave
  }
}

export function deleteSave (saveId: any) {
  return {
    type: 'DELETE_SAVE',
    saveId
  }
}

export function loadSave (cemuSave: any, saveId: any) {
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

export function setSaveData (save: any) {
  return {
    type: 'SET_SAVE_DATA',
    save
  }
}

export function setSaveCourse (courseId: any, course: any) {
  return {
    type: 'SET_SAVE_COURSE',
    courseId,
    course
  }
}

export function downloadCourse (courseId: any, modified: any) {
  return {
    type: 'SAVE_DOWNLOAD_COURSE',
    courseId,
    modified
  }
}

export function startDownloadCourse (courseId: any, dataLength: any) {
  return {
    type: 'START_DOWNLOAD_COURSE',
    courseId,
    dataLength
  }
}

export function progressDownloadCourse (courseId: any, dataLength: any) {
  return {
    type: 'PROGRESS_DOWNLOAD_COURSE',
    courseId,
    dataLength
  }
}

export function finishDownloadCourse (course: any, smmdbId: any) {
  return {
    type: 'FINISH_DOWNLOAD_COURSE',
    course,
    smmdbId
  }
}

export function addCourse (courseId: any) {
  return {
    type: 'SAVE_ADD_COURSE',
    courseId
  }
}

export function updateCourse (courseId: any, smmdbId: any, modified: any) {
  return {
    type: 'SAVE_UPDATE_COURSE',
    courseId,
    smmdbId,
    modified
  }
}

export function finishAddCourse (smmdbId: any, courseId: any, success: any) {
  return {
    type: 'FINISH_ADD_COURSE',
    smmdbId,
    courseId,
    success
  }
}

export function deleteCourse (smmdbId: any, courseId: any) {
  return {
    type: 'SAVE_DELETE_COURSE',
    smmdbId,
    courseId
  }
}

export function finishDeleteCourse (smmdbId: any, courseId: any, success: any) {
  return {
    type: 'FINISH_DELETE_COURSE',
    smmdbId,
    courseId,
    success
  }
}

export function deleteSelected (selected: any) {
  return {
    type: 'SAVE_DELETE_SELECTED',
    selected
  }
}

export function finishDeleteSelected (courseIds: any, smmdbIds: any, success: any) {
  return {
    type: 'FINISH_DELETE_SELECTED',
    courseIds,
    smmdbIds,
    success
  }
}

export function setSelected (selected: any) {
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

export function fillProgress (progress: any, limit: any) {
  return {
    type: 'FILL_PROGRESS',
    progress,
    limit
  }
}
