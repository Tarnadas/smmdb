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