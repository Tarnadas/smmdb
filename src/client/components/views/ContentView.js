import React from 'react'
import {
    connect
} from 'react-redux'

class ContentView extends React.PureComponent {
    render () {
        const page = this.props.page;
        return (
            <div>
                {
                    page === 'main' && (
                        <MainView />
                    )
                }
            </div>
        )
    }
}
export default connect(state => {
    const page = state.get('page');
    return {
        page
    }
})(ContentView);