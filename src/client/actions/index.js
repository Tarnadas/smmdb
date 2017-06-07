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