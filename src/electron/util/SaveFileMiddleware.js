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
    const onFinish = (course, smmdbId) => {
      dispatch(finishDownloadCourse(course, smmdbId))
    }
    const onAddFinish = (cemuSave, smmdbId, saveId, success) => {
      dispatch(finishAddCourse(cemuSave, smmdbId, saveId, success))
    }
    const onDeleteFinish = (cemuSave, smmdbId, saveId, success) => {
      dispatch(finishDeleteCourse(cemuSave, smmdbId, saveId, success))
    }
    switch (action.type) {
      case 'SAVE_DOWNLOAD_COURSE':
        saveFileEditor.downloadCourse(onStart, onProgress, onFinish, action.courseId, action.modified)
        break
      case 'SAVE_ADD_COURSE':
        saveFileEditor.addCourse(onAddFinish, action.courseId)
        break
      case 'SAVE_DELETE_COURSE':
        saveFileEditor.deleteCourse(onDeleteFinish, action.smmdbId, action.saveId)
        break
    }
    return next(action)
  }
}
