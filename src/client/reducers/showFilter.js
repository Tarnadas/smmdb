export default function showFilter (state, action) {
    if (!action) return state;
    switch (action.type) {
        case 'SHOW_FILTER':
            return action.showFilter;
    }
    return state;
}