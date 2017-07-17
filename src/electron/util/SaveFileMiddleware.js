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
    const onAddFinish = (smmdbId, saveId, success) => {
      dispatch(finishAddCourse(smmdbId, saveId, success))
    }
    const onDeleteFinish = (smmdbId, courseId, success) => {
      dispatch(finishDeleteCourse(smmdbId, courseId, success))
    }
    switch (action.type) {
      case 'SAVE_DOWNLOAD_COURSE':
        saveFileEditor.downloadCourse(onStart, onProgress, onFinish, action.courseId, action.modified)
        break
      case 'SAVE_ADD_COURSE':
        saveFileEditor.addCourse(onAddFinish, getState().getIn(['electron', 'cemuSave']), action.courseId)
        break
      case 'SAVE_DELETE_COURSE':
        saveFileEditor.deleteCourse(onDeleteFinish, getState().getIn(['electron', 'cemuSave']), action.smmdbId, action.courseId)
        break
    }
    return next(action)
  }
}
