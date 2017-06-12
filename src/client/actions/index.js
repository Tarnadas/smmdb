export function addChatMessageGlobal (timestamp, userName, message) {
    return {
        type: 'ADD_CHAT_MESSAGE_GLOBAL',
        timestamp,
        userName,
        message
    }
}

export function setUserId (userId) {
    return {
        type: 'SET_USER_ID',
        userId
    }
}

export function setCourses (courses) {
    return {
        type: 'SET_COURSES',
        courses
    }
}

export function setVideoId (videoId) {
    return {
        type: 'SET_VIDEO_ID',
        videoId
    }
}