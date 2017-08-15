import React from 'react'
import {
  connect
} from 'react-redux'
import {
  Route, withRouter
} from 'react-router-dom'

import MainView from './MainView'
import CoursesView from './CoursesView'
import UploadView from './UploadView'
import ProfileView from './ProfileView'
import FAQView from './FAQView'
import SocialView from './SocialView'

import {
  ScreenSize
} from '../../reducers/mediaQuery'

class ContentView extends React.PureComponent {
  componentDidUpdate (prevProps, prevState, prevContext) {
    if (this.props.location !== prevProps.location) {
      this.props.global.scrollTop = 0
    }
  }
  render () {
    const screenSize = this.props.screenSize
    const styles = {
      content: {
        backgroundColor: '#24997e',
        height: screenSize >= ScreenSize.MEDIUM ? '0%' : 'auto',
        textAlign: 'center',
        flex: screenSize >= ScreenSize.MEDIUM ? '1 0 auto' : '1 0 0%'
      }
    }
    return (
      <div style={styles.content}>
        <Route exact path='/' component={MainView} />
        <Route path='/courses' render={() => (
          <CoursesView shouldUpdate={this.props.shouldUpdate} />
        )} />
        <Route path='/upload' render={() => (
          <UploadView shouldUpdate={this.props.shouldUpdate} setFetchCourses={this.props.setFetchCourses} />
        )} />
        <Route path='/profile' component={ProfileView} />
        <Route path='/faq' component={FAQView} />
        <Route path='/social' component={SocialView} />
      </div>
    )
  }
}
export default withRouter(connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(ContentView))
