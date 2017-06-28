import {
    Map
} from 'immutable';

export default function userData (state, action) {
    if (!action) return state;
    switch (action.type) {
        case 'SET_ACCOUNT_DATA':
            state = state.set('accountData', !!action.accountData ? Map(action.accountData) : Map());
            return state;
        case 'SET_VIDEO_ID':
            state = state.set('videoId', action.videoId);
            return state;
    }
    return state;
}