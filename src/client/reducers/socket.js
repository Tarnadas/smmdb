export default function socket (state, action) {
    if (!action) return state;
    switch (action.type) {
        case 'SET_SOCKET':
            state = action.socket;
            return state;
    }
    return state;
}