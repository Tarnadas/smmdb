import React from 'react'
import {
    connect
} from 'react-redux'

import MainView   from './MainView'
import StatsPanel from '../panels/StatsPanel'

class ContentView extends React.PureComponent {
    render () {
        const page = this.props.page;
        const styles = {
            content: {
                backgroundColor: '#24997e',
                height: 'calc(100% - 162px)',
                textAlign: 'center'
            }
        };
        return (
            <div style={styles.content}>
                <StatsPanel />
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