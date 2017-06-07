import {
    fromJS
} from 'immutable';

export default function userData (state, action) {
    if (!action) return state;
    switch (action.type) {
        case 'SET_USER_ID':
            state = state.set('userId', action.userId);
            return state;
        case 'SET_USERNAME':
            state = state.set('userName', action.userName);
            return state;
        case 'SET_ROOM':
            if (!!action.room) {
                state = state.set('room', fromJS(action.room));
            } else {
                state = state.delete('room');
            }
            return state;
    }
    return state;
}