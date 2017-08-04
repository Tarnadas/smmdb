import React from 'react'
import {
  connect
} from 'react-redux'
import {
  Route, withRouter
} from 'react-router-dom'

import MainView from './MainView'
import UploadView from './UploadView'
import ProfileView from './ProfileView'

import {
  ScreenSize
} from '../../reducers/mediaQuery'

class ContentView extends React.PureComponent {
  render () {
    const screenSize = this.props.screenSize
    const styles = {
      content: {
        backgroundColor: '#24997e',
        height: screenSize >= ScreenSize.MEDIUM ? '0%' : 'auto',
        textAlign: 'center',
        flex: '1'
      }
    }
    return (
      <div style={styles.content}>
        <Route exact path='/' render={() => (
          <MainView shouldUpdate={this.props.shouldUpdate} />
        )} />
        <Route path='/upload' render={() => (
          <UploadView shouldUpdate={this.props.shouldUpdate} />
        )} />
        <Route path='/profile' component={ProfileView} />
      </div>
    )
  }
}
export default withRouter(connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(ContentView))
