import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Route, withRouter } from 'react-router-dom'

import BlogView from './BlogView'
import Courses2View from './Courses2View'
import Courses64View from './Courses64View'
import CoursesView from './CoursesView'
import FAQView from './FAQView'
import LegalNoticeView from './LegalNoticeView'
import MainView from './MainView'
import PrivacyPolicyView from './PrivacyPolicyView'
import ProfileView from './ProfileView'
import SocialView from './SocialView'
import Upload64View from './Upload64View'
import UploadView from './UploadView'
import Upload2View from './Upload2View'

import { ScreenSize } from '../../reducers/mediaQuery'

class View extends React.PureComponent<any, any> {
  public componentDidUpdate (prevProps: any): void {
    if (this.props.location !== prevProps.location) {
      this.props.global.scrollTop = 0
    }
  }

  public render (): JSX.Element {
    const { screenSize } = this.props
    const styles: any = {
      content: {
        backgroundColor: '#24997e',
        height: screenSize >= ScreenSize.MEDIUM ? '0%' : 'auto',
        textAlign: 'center',
        flex: screenSize >= ScreenSize.MEDIUM ? '1 0 auto' : '1 0 0%'
      }
    }
    return (
      <div style={styles.content}>
        <Helmet>
          <title>SMMDB</title>
          <meta
            name="description"
            content="Super Mario Maker, Super Mario Maker 2 and Super Mario 64 Maker course database for consoles Switch, Wii U, 3DS and emulators Yuzu, Cemu, Citra and decaf."
          />
        </Helmet>
        <Route exact path="/" component={MainView} />
        <Route
          path="/courses"
          render={(): JSX.Element => (
            <CoursesView
              shouldUpdate={this.props.shouldUpdate}
              setFetchCourses={this.props.setFetchCourses}
              isServer={this.props.isServer}
            />
          )}
        />
        <Route
          path="/courses2"
          render={(): JSX.Element => (
            <Courses2View setScrollCallback={this.props.setScrollCallback} />
          )}
        />
        <Route
          path="/courses64"
          render={(): JSX.Element => (
            <Courses64View
              shouldUpdate={this.props.shouldUpdate}
              setFetchCourses={this.props.setFetchCourses}
              isServer={this.props.isServer}
            />
          )}
        />
        <Route
          path="/upload"
          render={(): JSX.Element => (
            <UploadView
              shouldUpdate={this.props.shouldUpdate}
              setFetchCourses={this.props.setFetchCourses}
              isServer={this.props.isServer}
            />
          )}
        />
        <Route
          path="/upload2"
          render={(): JSX.Element => (
            <Upload2View setScrollCallback={this.props.setScrollCallback} />
          )}
        />
        <Route
          path="/upload64"
          render={(): JSX.Element => (
            <Upload64View
              shouldUpdate={this.props.shouldUpdate}
              setFetchCourses={this.props.setFetchCourses}
              isServer={this.props.isServer}
            />
          )}
        />
        <Route
          path="/blog"
          render={(): JSX.Element => (
            <BlogView isServer={this.props.isServer} />
          )}
        />
        <Route path="/profile" component={ProfileView} />
        <Route path="/faq" component={FAQView} />
        <Route path="/social" component={SocialView} />
        <Route path="/privacy" component={PrivacyPolicyView} />
        <Route path="/legal" component={LegalNoticeView} />
      </div>
    )
  }
}
export const ContentView = withRouter(connect(
  (state: any): any => ({
    screenSize: state.getIn(['mediaQuery', 'screenSize'])
  })
)(View) as any) as any
