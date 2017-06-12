import React from 'react'
import {
    connect
} from 'react-redux'

import MainView from './MainView'

class ContentView extends React.PureComponent {
    render () {
        const page = this.props.page;
        const styles = {
            content: {
                backgroundColor: '#24997e',
                minHeight: 'calc(100% - 180px)',
                maxHeight: 'calc(100% - 162px)',
                textAlign: 'center'
            }
        };
        return (
            <div style={styles.content}>
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
    const page = 'main';//state.get('page');
    return {
        page
    }
})(ContentView);