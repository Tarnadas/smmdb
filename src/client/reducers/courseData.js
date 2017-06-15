import {
    List
} from 'immutable'

export default function courseData (state, action) {
    if (!action) return state;
    switch (action.type) {
        case 'SET_COURSES':
            if (action.concat) {
                state = state.concat(action.courses);
            } else {
                state = new List(action.courses);
            }
            return state;
    }
    return state;
}