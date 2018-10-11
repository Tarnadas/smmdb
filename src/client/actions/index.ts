export function setAccountData (accountData?: any): any {
  return {
    type: 'SET_ACCOUNT_DATA',
    accountData
  }
}

export function setStats (stats: any): any {
  return {
    type: 'SET_STATS',
    stats
  }
}

export function setCourse (id: any, course: any): any {
  return {
    type: 'SET_COURSE',
    id,
    course
  }
}

export function setCourse64 (id: any, course: any): any {
  return {
    type: 'SET_COURSE64',
    id,
    course
  }
}

export function setCourses (courses: any, concat: any): any {
  return {
    type: 'SET_COURSES',
    courses,
    concat
  }
}

export function setCourses64 (courses: any, concat: any): any {
  return {
    type: 'SET_COURSES64',
    courses,
    concat
  }
}

export function deleteCourse (courseId: any): any {
  return {
    type: 'DELETE_COURSE',
    courseId
  }
}

export function deleteCourse64 (courseId: any): any {
  return {
    type: 'DELETE_COURSE64',
    courseId
  }
}

export function setCourseSelf (id: any, course: any): any {
  return {
    type: 'SET_COURSE_SELF',
    id,
    course
  }
}

export function setCourseSelf64 (id: any, course: any): any {
  return {
    type: 'SET_COURSE_SELF64',
    id,
    course
  }
}

export function setCoursesSelf (courses: any, concat: any): any {
  return {
    type: 'SET_COURSES_SELF',
    courses,
    concat
  }
}

export function setCoursesSelf64 (courses: any, concat: any): any {
  return {
    type: 'SET_COURSES_SELF64',
    courses,
    concat
  }
}

export function deleteCourseSelf (courseId: any): any {
  return {
    type: 'DELETE_COURSE_SELF',
    courseId
  }
}

export function deleteCourseSelf64 (courseId: any): any {
  return {
    type: 'DELETE_COURSE_SELF64',
    courseId
  }
}

export function setCourseUploaded (id: any, course: any): any {
  return {
    type: 'SET_COURSE_UPLOADED',
    id,
    course
  }
}

export function setCourseUploaded64 (id: any, course: any): any {
  return {
    type: 'SET_COURSE_UPLOADED64',
    id,
    course
  }
}

export function setCoursesUploaded (courses: any, concat: any): any {
  return {
    type: 'SET_COURSES_UPLOADED',
    courses,
    concat
  }
}

export function setCoursesUploaded64 (courses: any, concat: any): any {
  return {
    type: 'SET_COURSES_UPLOADED64',
    courses,
    concat
  }
}

export function deleteCourseUploaded (courseId: any): any {
  return {
    type: 'DELETE_COURSE_UPLOADED',
    courseId
  }
}

export function deleteCourseUploaded64 (courseId: any): any {
  return {
    type: 'DELETE_COURSE_UPLOADED64',
    courseId
  }
}

export function setUpload (id: any, upload: any): any {
  return {
    type: 'SET_UPLOAD',
    id,
    upload
  }
}

export function setUpload64 (id: any, upload: any): any {
  return {
    type: 'SET_UPLOAD64',
    id,
    upload
  }
}

export function deleteUpload (id: any): any {
  return {
    type: 'DELETE_UPLOAD',
    id
  }
}

export function deleteUpload64 (id: any): any {
  return {
    type: 'DELETE_UPLOAD64',
    id
  }
}

export function setReupload (id: any, upload: any): any {
  return {
    type: 'SET_REUPLOAD',
    id,
    upload
  }
}

export function setReupload64 (id: any, upload: any): any {
  return {
    type: 'SET_REUPLOAD64',
    id,
    upload
  }
}

export function deleteReupload (id: any): any {
  return {
    type: 'DELETE_REUPLOAD',
    id
  }
}

export function deleteReupload64 (id: any): any {
  return {
    type: 'DELETE_REUPLOAD64',
    id
  }
}

export function setUploadImageFull (id: any, upload: any): any {
  return {
    type: 'SET_UPLOAD_IMAGE_FULL',
    id,
    upload
  }
}

export function deleteUploadImageFull (id: any): any {
  return {
    type: 'DELETE_UPLOAD_IMAGE_FULL',
    id
  }
}

export function setUploadImagePreview (id: any, upload: any): any {
  return {
    type: 'SET_UPLOAD_IMAGE_PREVIEW',
    id,
    upload
  }
}

export function deleteUploadImagePreview (id: any): any {
  return {
    type: 'DELETE_UPLOAD_IMAGE_PREVIEW',
    id
  }
}

export function setUploadImage64 (id: any, upload: any): any {
  return {
    type: 'SET_UPLOAD_IMAGE64',
    id,
    upload
  }
}

export function deleteUploadImage64 (id: any): any {
  return {
    type: 'DELETE_UPLOAD_IMAGE64',
    id
  }
}

export function setUploadBlog (id: any, upload: any): any {
  return {
    type: 'SET_UPLOAD_BLOG',
    id,
    upload
  }
}

export function deleteUploadBlog (id: any): any {
  return {
    type: 'DELETE_UPLOAD_BLOG',
    id
  }
}

export function showFilter (showFilter: any): any {
  return {
    type: 'SHOW_FILTER',
    showFilter
  }
}

export function setFilter (filter: any): any {
  return {
    type: 'SET_FILTER',
    filter
  }
}

export function resetFilter (): any {
  return {
    type: 'RESET_FILTER'
  }
}

export function applyFilter (): any {
  return {
    type: 'APPLY_FILTER'
  }
}

export function setOrder (order: any): any {
  return {
    type: 'SET_ORDER',
    order
  }
}

export function resetOrder (): any {
  return {
    type: 'RESET_ORDER'
  }
}

export function swapOrder (): any {
  return {
    type: 'SWAP_ORDER'
  }
}

export function setVideoId (videoId: any): any {
  return {
    type: 'SET_VIDEO_ID',
    videoId
  }
}

export function mediaQuery (screenSize: any): any {
  return {
    type: 'MEDIA_QUERY',
    screenSize
  }
}
