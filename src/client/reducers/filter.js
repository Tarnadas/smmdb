import {
    Map
} from 'immutable'

export default function filter (state, action) {
    if (!action) return state;
    switch (action.type) {
        case 'SET_FILTER':
            state = state.set('nextFilter', Map(action.filter));
            return state;
        case 'APPLY_FILTER':
            state = state.set('currentFilter', state.get('nextFilter'));
            return state;
    }
    return state;
}