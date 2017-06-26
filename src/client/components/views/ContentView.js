import React from 'react'
import {
    connect
} from 'react-redux'
import {
    Route, withRouter
} from 'react-router-dom'

import MainView    from './MainView'
import UploadView  from './UploadView'
import ProfileView from './ProfileView'

class ContentView extends React.PureComponent {
    render () {
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
                <Route exact path="/" render={() => (
                    <MainView shouldUpdate={this.props.shouldUpdate} />
                )} />
                <Route path="/upload" component={UploadView} />
                <Route path="/profile" component={ProfileView} />
            </div>
        )
    }
}
export default withRouter(connect()(ContentView));