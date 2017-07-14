import {
  startDownloadCourse, progressDownloadCourse, finishDownloadCourse, finishAddCourse, finishDeleteCourse
} from '../actions'

export default function saveFileMiddleware (saveFileEditor) {
  return ({ dispatch, getState }) => next => action => {
    const onStart = (courseId, dataLength) => {
      dispatch(startDownloadCourse(courseId, dataLength))
    }
    const onProgress = (courseId, dataLength) => {
      dispatch(progressDownloadCourse(courseId, dataLength))
    }
    const onFinish = (courseId) => {
      dispatch(finishDownloadCourse(courseId))
    }
    const onAddFinish = (cemuSave, smmdbId, saveId, success) => {
      dispatch(finishAddCourse(cemuSave, smmdbId, saveId, success))
    }
    const onDeleteFinish = (cemuSave, smmdbId, saveId, success) => {
      dispatch(finishDeleteCourse(cemuSave, smmdbId, saveId, success))
    }
    switch (action.type) {
      case 'DOWNLOAD_COURSE':
        saveFileEditor.downloadCourse(onStart, onProgress, onFinish, action.courseId, action.courseName, action.ownerName, action.videoId, action.courseType, action.modified)
        break
      case 'ADD_COURSE':
        saveFileEditor.addCourse(onAddFinish, action.courseId)
        break
      case 'DELETE_COURSE':
        saveFileEditor.deleteCourse(onDeleteFinish, action.smmdbId, action.saveId)
        break
    }
    return next(action)
  }
}