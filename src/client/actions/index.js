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

export function setCourse64 (id, course) {
  return {
    type: 'SET_COURSE64',
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

export function setCourses64 (courses, concat) {
  return {
    type: 'SET_COURSES64',
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

export function deleteCourse64 (courseId) {
  return {
    type: 'DELETE_COURSE64',
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

export function setCourseSelf64 (id, course) {
  return {
    type: 'SET_COURSE_SELF64',
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

export function setCoursesSelf64 (courses, concat) {
  return {
    type: 'SET_COURSES_SELF64',
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

export function deleteCourseSelf64 (courseId) {
  return {
    type: 'DELETE_COURSE_SELF64',
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

export function setCourseUploaded64 (id, course) {
  return {
    type: 'SET_COURSE_UPLOADED64',
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

export function setCoursesUploaded64 (courses, concat) {
  return {
    type: 'SET_COURSES_UPLOADED64',
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

export function deleteCourseUploaded64 (courseId) {
  return {
    type: 'DELETE_COURSE_UPLOADED64',
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

export function setUpload64 (id, upload) {
  return {
    type: 'SET_UPLOAD64',
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

export function deleteUpload64 (id) {
  return {
    type: 'DELETE_UPLOAD64',
    id
  }
}

export function setReupload (id, upload) {
  return {
    type: 'SET_REUPLOAD',
    id,
    upload
  }
}

export function setReupload64 (id, upload) {
  return {
    type: 'SET_REUPLOAD64',
    id,
    upload
  }
}

export function deleteReupload (id) {
  return {
    type: 'DELETE_REUPLOAD',
    id
  }
}

export function deleteReupload64 (id) {
  return {
    type: 'DELETE_REUPLOAD64',
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

export function setUploadImage64 (id, upload) {
  return {
    type: 'SET_UPLOAD_IMAGE64',
    id,
    upload
  }
}

export function deleteUploadImage64 (id) {
  return {
    type: 'DELETE_UPLOAD_IMAGE64',
    id
  }
}

export function setUploadBlog (id, upload) {
  return {
    type: 'SET_UPLOAD_BLOG',
    id,
    upload
  }
}

export function deleteUploadBlog (id) {
  return {
    type: 'DELETE_UPLOAD_BLOG',
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

export function resetFilter () {
  return {
    type: 'RESET_FILTER'
  }
}

export function applyFilter () {
  return {
    type: 'APPLY_FILTER'
  }
}

export function setOrder (order) {
  return {
    type: 'SET_ORDER',
    order
  }
}

export function resetOrder () {
  return {
    type: 'RESET_ORDER'
  }
}

export function swapOrder () {
  return {
    type: 'SWAP_ORDER'
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

export function setAmazonProducts (products) {
  return {
    type: 'SET_AMAZON_PRODUCTS',
    products
  }
}
