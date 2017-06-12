import {
    List
} from 'immutable'

export default function courseData (state, action) {
    if (!action) return state;
    switch (action.type) {
        case 'SET_COURSES':
            return new List(action.courses);
    }
    return state;
}