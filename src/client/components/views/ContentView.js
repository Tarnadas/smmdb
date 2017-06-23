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
                height: 'auto',
                textAlign: 'center',
                flex: '1'
            }
        };
        return (
            <div style={styles.content}>
                <StatsPanel />
                {
                    page === 'main' && (
                        <MainView shouldUpdate={this.props.shouldUpdate} />
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