import {
  startDownloadCourse, progressDownloadCourse, finishDownloadCourse, finishAddCourse, finishDeleteCourse, finishDeleteSelected, fillProgress
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
    const onDeleteSelectedFinish = (selected, smmdbIds, success) => {
      dispatch(finishDeleteSelected(selected, smmdbIds, success))
    }
    const onFillProgress = (progress, limit) => {
      dispatch(fillProgress(progress, limit))
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
      case 'SAVE_UPDATE_COURSE':
        saveFileEditor.updateCourse(action.courseId && [
          onDeleteFinish, getState().getIn(['electron', 'cemuSave']), action.smmdbId, action.courseId
        ], [
          onStart, onProgress, onFinish, action.smmdbId, action.modified
        ], action.courseId && [
          onAddFinish, getState().getIn(['electron', 'cemuSave']), action.smmdbId
        ]
        )
        break
      case 'SAVE_DELETE_SELECTED':
        saveFileEditor.deleteSelected(onDeleteSelectedFinish, getState().getIn(['electron', 'cemuSave']), action.selected, getState().getIn(['electron', 'appSaveData', 'cemuSaveData', getState().getIn(['electron', 'currentSave']), 'save']))
        break
      case 'FILL_SAVE':
        saveFileEditor.fillSave({onStart, onProgress, onFinish}, {onAddFinish}, getState().getIn(['electron', 'cemuSave']),
          onFillProgress, getState().getIn(['filter', 'currentFilter']), getState().get('order'), getState().getIn(['electron', 'appSaveData', 'downloads']), getState().getIn(['electron', 'appSaveData', 'cemuSaveData', getState().getIn(['electron', 'currentSave']), 'smmdb']))
        break
      case 'FILL_SAVE_RANDOM':
        saveFileEditor.fillSave({onStart, onProgress, onFinish}, {onAddFinish}, getState().getIn(['electron', 'cemuSave']),
          onFillProgress, getState().getIn(['filter', 'currentFilter']), getState().get('order'), getState().getIn(['electron', 'appSaveData', 'downloads']), getState().getIn(['electron', 'appSaveData', 'cemuSaveData', getState().getIn(['electron', 'currentSave']), 'smmdb']), true)
        break
    }
    return next(action)
  }
}
