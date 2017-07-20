export function setAccountData (accountData) {
  return {
    type: 'SET_ACCOUNT_DATA',
    accountData
  }
}

export function setStats (stats) {
  return {
    type: 'SET_STATS',
    stats
  }
}

export function setCourse (id, course) {
  return {
    type: 'SET_COURSE',
    id,
    course
  }
}

export function setCourses (courses, concat) {
  return {
    type: 'SET_COURSES',
    courses,
    concat
  }
}

export function deleteCourse (courseId) {
  return {
    type: 'DELETE_COURSE',
    courseId
  }
}

export function setCourseSelf (id, course) {
  return {
    type: 'SET_COURSE_SELF',
    id,
    course
  }
}

export function setCoursesSelf (courses, concat) {
  return {
    type: 'SET_COURSES_SELF',
    courses,
    concat
  }
}

export function deleteCourseSelf (courseId) {
  return {
    type: 'DELETE_COURSE_SELF',
    courseId
  }
}

export function setCourseUploaded (id, course) {
  return {
    type: 'SET_COURSE_UPLOADED',
    id,
    course
  }
}

export function setCoursesUploaded (courses, concat) {
  return {
    type: 'SET_COURSES_UPLOADED',
    courses,
    concat
  }
}

export function deleteCourseUploaded (courseId) {
  return {
    type: 'DELETE_COURSE_UPLOADED',
    courseId
  }
}

export function setUpload (id, upload) {
  return {
    type: 'SET_UPLOAD',
    id,
    upload
  }
}

export function deleteUpload (id) {
  return {
    type: 'DELETE_UPLOAD',
    id
  }
}

export function setUploadImageFull (id, upload) {
  return {
    type: 'SET_UPLOAD_IMAGE_FULL',
    id,
    upload
  }
}

export function deleteUploadImageFull (id) {
  return {
    type: 'DELETE_UPLOAD_IMAGE_FULL',
    id
  }
}

export function setUploadImagePreview (id, upload) {
  return {
    type: 'SET_UPLOAD_IMAGE_PREVIEW',
    id,
    upload
  }
}

export function deleteUploadImagePreview (id) {
  return {
    type: 'DELETE_UPLOAD_IMAGE_PREVIEW',
    id
  }
}

export function showFilter (showFilter) {
  return {
    type: 'SHOW_FILTER',
    showFilter
  }
}

export function setFilter (filter) {
  return {
    type: 'SET_FILTER',
    filter
  }
}

export function applyFilter () {
  return {
    type: 'APPLY_FILTER'
  }
}

export function setVideoId (videoId) {
  return {
    type: 'SET_VIDEO_ID',
    videoId
  }
}

export function mediaQuery (screenSize) {
  return {
    type: 'MEDIA_QUERY',
    screenSize
  }
}
