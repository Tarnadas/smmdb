import {
    List
} from 'immutable'

export default function courseDataSelf (state, action) {
    if (!action) return state;
    switch (action.type) {
        case 'SET_COURSES_SELF':
            if (action.concat) {
                state = state.concat(action.courses);
            } else {
                state = List(action.courses);
            }
            return state;
    }
    return state;
}