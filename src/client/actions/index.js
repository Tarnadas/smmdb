export function addChatMessageGlobal (timestamp, userName, message) {
    return {
        type: 'ADD_CHAT_MESSAGE_GLOBAL',
        timestamp,
        userName,
        message
    }
}

export function setAccountData (accountData) {
    return {
        type: 'SET_ACCOUNT_DATA',
        accountData
    }
}

export function setUserId (userId) {
    return {
        type: 'SET_USER_ID',
        userId
    }
}

export function setCourses (courses, concat) {
    return {
        type: 'SET_COURSES',
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