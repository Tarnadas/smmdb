import React from 'react'
import {
  connect
} from 'react-redux'
import {
  Route, withRouter
} from 'react-router-dom'

import MainView from './MainView'
import CoursesView from './CoursesView'
import Courses64View from './Courses64View'
import UploadView from './UploadView'
import Upload64View from './Upload64View'
import ProfileView from './ProfileView'
import FAQView from './FAQView'
import SocialView from './SocialView'
import BlogView from './BlogView'
import PrivacyPolicyView from './PrivacyPolicyView'
import LegalNoticeView from './LegalNoticeView'

import {
  ScreenSize
} from '../../reducers/mediaQuery'
import Net64View from './Net64View'

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
    // <Route path='/blog' component={BlogView} />
    return (
      <div style={styles.content}>
        <Route exact path='/' component={MainView} />
        <Route path='/courses' render={() => (
          <CoursesView shouldUpdate={this.props.shouldUpdate} setFetchCourses={this.props.setFetchCourses} isServer={this.props.isServer} />
        )} />
        <Route path='/courses64' render={() => (
          <Courses64View shouldUpdate={this.props.shouldUpdate} setFetchCourses={this.props.setFetchCourses} isServer={this.props.isServer} />
        )} />
        <Route path='/upload' render={() => (
          <UploadView shouldUpdate={this.props.shouldUpdate} setFetchCourses={this.props.setFetchCourses} isServer={this.props.isServer} />
        )} />
        <Route path='/upload64' render={() => (
          <Upload64View shouldUpdate={this.props.shouldUpdate} setFetchCourses={this.props.setFetchCourses} isServer={this.props.isServer} />
        )} />
        <Route path='/net64' render={() => (
          <Net64View isServer={this.props.isServer} />
        )} />
        <Route path='/profile' component={ProfileView} />
        <Route path='/faq' component={FAQView} />
        <Route path='/social' component={SocialView} />
        <Route path='/privacy' component={PrivacyPolicyView} />
        <Route path='/legal' component={LegalNoticeView} />
      </div>
    )
  }
}
export default withRouter(connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(ContentView))
